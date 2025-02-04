# meilisearch-dangerzone

``
pip install -r requirements.txt
``

Run Meilisearch Docker

```
docker pull getmeili/meilisearch:v1.12
docker run -it --rm \
    -p 7700:7700 \
    -e MEILI_ENV='development' \
    getmeili/meilisearch:v1.12
```


    -v ~/meili_data:/meili_data \