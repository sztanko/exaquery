alter session set NLS_TIMESTAMP_FORMAT = 'YYYY-MM-DD HH24:MI:SS.FF3';
export (
select * from EXA_DBA_AUDIT_SQL where stop_time>='2015-02-28 03:25:32.878' and start_time<='2015-02-28 23:25:32.878'
) 
into local CSV FILE '/home/ingres/exaquery_server/out.tsv' 
column separator = 'TAB' 

-- row separator = 'CR'  
replace;
