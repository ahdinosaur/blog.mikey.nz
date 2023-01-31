title: dokku Wildcard SSL
date: 2014-12-25T22:19:35.591Z
tags:
---
```
openssl genrsa -des3 -out server.key.secure 4096
openssl rsa -in server.key.secure -out server.key
openssl req -new -key server.key.secure -out server.csr
```

```
cat server.csr
```

copy into namecheap EssentialSSL Wildcard activiation form.

http://progrium.viewdocs.io/dokku/nginx#user-content-all-subdomains
