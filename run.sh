cd app/backend
api_url=${API_URL:-"/api/exaquery/"}
echo "API URL IS $api_url"
sed -i "s/__APIURL__/${api_url//\//\\/}/g" ../ui/build/static/js/*.js
HTML=../ui/build python3 run.py
