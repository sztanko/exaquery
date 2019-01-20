from jinja2 import Environment
from .config import get_logger




log = get_logger()

def gen_export(
    base_queries, start_time: int, stop_time: int, granularity: int, threshold: int, params: dict) -> str:
    base_q_template = ",\n".join([f"{k} as (\n{v}\n)" for k, v in base_queries.items()])
    base_q = Environment().from_string(base_q_template).render(params)
    time_unit_duration = (stop_time - start_time) / granularity
    max_event_duration = time_unit_duration / threshold
    q = f"""
        with
        -- Base
        {base_q},
        -- Add time constraints
        base_with_time_limit as (
            select * from base 
                where 
                    start_time<'{stop_time}'
                    and stop_time>'{start_time}'
            order by null
        ),
        -- some transformations, for convenience reasons
        base_with_time_unit as (
            select base_with_time_limit.*,
                cast({time_unit_duration} * floor(start_time / {time_unit_duration}) as varchar(10000)) as time_unit,
                {time_unit_duration} as time_unit_duration,
                stop_time - start_time as event_duration,
                {max_event_duration} as max_event_duration
            from base_with_time_limit
        ),
        -- calculate clusters of events
        dense_periods as (
            select gr,
                time_unit as box_id,
                'EVENT_GROUP' as modifier,
                min(flag) as flag,
                sum(metric) as metric,
                min(start_time) as start_time,
                max(start_time) as stop_time
            from base_with_time_unit 
                where event_duration < max_event_duration
            group by 1,2,3
            having count(1)>{threshold*2}
        ),
        -- deduct dense perios from raw stream
        sparse_base as (
            select 
                gr, box_id, modifier, flag, metric, start_time, stop_time from base_with_time_unit bwtu
            where 
                event_duration >= bwtu.max_event_duration
                or not exists(
                    select 
                        dp.gr, dp.box_id
                    from dense_periods dp 
                    where 
                        dp.gr=bwtu.gr and dp.box_id=bwtu.time_unit)
        ),

        final_result as (
                select * from sparse_base 
            UNION ALL 
                select * from dense_periods
        )
        
        select * from final_result order by gr, start_time, box_id
        """
    return q

def process_resultset(l, from_ts, to_ts):
    # This is to ensure we don't have infitely large boxes.
    min_ts = from_ts # - (to_ts - from_ts)/4
    max_ts = to_ts # + (to_ts - from_ts)/4
    for row in l:
        try:
            d = {
                'group': row['GR'],
                'box_id': row["BOX_ID"],
                'modifier': row["MODIFIER"],
                'flag': int(row['FLAG']),
                'metric': float(row['METRIC']),
                'start_time': max(float(row['START_TIME']), min_ts),
                'stop_time': min(float(row['STOP_TIME']), max_ts),
            }
            yield(d)
        except Exception as e:
            log.exception(e)
            log.error(row)
