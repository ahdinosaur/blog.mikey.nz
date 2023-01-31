title: self-hosted web IRC bouncer with IRCAnywhere and dokku
date: 2014-09-17T22:55:17.969Z
tags:
---
hi friend. :)


this is a guide to help you host your own web IRC bouncer like [IRCCloud](https://www.irccloud.com/) using [IRCAnywhere](http://ircanywhere.com/) and [dokku](https://github.com/progrium/dokku).


## prerequisites

this guide assumes:

- you have a dokku setup ready to go. if not i recommend following the instructions [here](https://github.com/progrium/dokku#installing), or for maximum ease using the [one-click Digital Ocean install](https://www.digitalocean.com/community/tutorials/how-to-use-the-digitalocean-dokku-application).
- you have a [GitHub](https://github.com) account. if not, [make one](https://github.com/join).

for reference, here's the IRCAnywhere [demo](http://try.ircanywhere.com/) and [documentation](http://docs.ircanywhere.com/en/latest/).


## step 1: fork IRCAnywhere

go to [ircanywhere/ircanywhere](https://github.com/ircanywhere/ircanywhere) and click on the top right "Fork" button to fork the project as your current user. now, in your new piwik repo, click on "Settings", then rename your repo to `analytics.<your-dokku-domain.tld>`.

next, clone your piwik repo to your local machine with

```bash
git clone https://github.com/<your-name>/analytics.<your-dokku-domain.tld>
cd analytics.<your-dokku-domain.tld>
```

add the dokku remotes

```bash
git remote add dokku dokku@<your-dokku-domain.tld>:analytics
```

push to dokku!

```bash
git push dokku master
```

it won't work, but soon. :p

- `git checkout -B build` to make build branch
- `gulp` to build
- remove `client/build/*` line from .gitignore
- add files and commit

- `git checkout -B deploy` to make deploy branch
- remove `config.js` line from .gitingore
- add and commit `config.js`
- `echo "web: node . run" > Procfile` and commit `Procfile`

root@green-screen:~# mkdir /var/www/irc
root@green-screen:~# mkdir /var/www/irc/logs
root@green-screen:~# dokku docker-options:add irc "-v /var/www/irc/logs:/app/logs"

- https://github.com/jeffutter/dokku-mongodb-plugin
git clone https://github.com/jeffutter/dokku-mongodb-plugin.git /var/lib/dokku/plugins/mongodb
dokku plugins-install
