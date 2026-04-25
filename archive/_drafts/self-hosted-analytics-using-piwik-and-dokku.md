layout: post
title: Self-Hosted Analytics Using Piwik and Dokku
date: 2015-09-20T07:30:00.000Z
updated: 2015-09-20T07:30:35.148Z
---
Hi friend! :)

This is a guide to help you host your own analytics using [piwik](http://piwik.org/) and [dokku](https://github.com/progrium/dokku).


**This guide is a little rough around the edges, I can't guarantee that everything works. If it does or does not, [message me](http://dinosaur.is)! <3**

Last tested with [Piwik 2.14.3](https://github.com/piwik/piwik/releases/tag/2.14.3) and [Dokku v0.3.26](https://github.com/progrium/dokku/releases/tag/v0.3.26).

## Prerequisites

This guide assumes:

- You have a dokku setup ready to go. If not i recommend following the instructions [here](https://github.com/progrium/dokku#installing), or for maximum ease using the [one-click Digital Ocean install](https://www.digitalocean.com/community/tutorials/how-to-use-the-digitalocean-dokku-application).
- You have a [GitHub](https://github.com) account. if not, [make one](https://github.com/join).

For reference, here are the vanilla [Piwiki installation instructions](http://piwik.org/docs/installation/).


## Step 1: Fork piwik repository

Go to [piwik/piwik](https://github.com/piwik/piwik) and click on the top right "Fork" button to fork the project as your current user. Now, in your new piwik repo, click on "Settings", then rename your repo to `analytics.<your-dokku-domain.tld>`.

Next, clone your piwik repo to your local machine with

```bash
git clone https://github.com/<your-name>/analytics.<your-dokku-domain.tld>
cd analytics.<your-dokku-domain.tld>
```

Add the dokku remotes

```bash
git remote add dokku dokku@<your-dokku-domain.tld>:analytics
```

Push to dokku!

```bash
git push dokku master
```

It won't work, but soon. :p


## Step 2: Install dokku plugins


Let's install some plugins. :) To do this, login to our dokku server with `ssh root@<your-dokku-domain.tld>`.

```
cd /var/lib/dokku/plugins
```

### [mariadb](https://github.com/krisrang/dokku-mariadb)

```

git clone https://github.com/krisrang/dokku-mariadb mariadb
dokku plugins-install
```

## step 3. configure server


time to configure, so our analytics app has what it needs.


first make some directories on the server:

```
mkdir /var/www/analytics/
mkdir /var/www/analytics/tmp/assets
mkdir /var/www/analytics/tmp/cache
mkdir /var/www/analytics/tmp/logs
mkdir /var/www/analytics/tmp/tcpdf
mkdir /var/www/analytics/tmp/templates_c
mkdir /var/www/analytics/config
```

now from our local machine within our forked repo, let's copy the global config to the server. (*note: we will need to do this if we ever update our repo to match upstream updates.*)

```
scp config/global.ini.php root@<your-dokku-domain.tld>:/var/www/analytics/config
```

next, change the permissions of our new directories and file.

```
chown -R nobody:nogroup /var/www/analytics/
chmod -R 0755 /var/www/analytics/
```

then, we configure our app to use our new directories:

```
dokku docker-options:add analytics "-v /var/www/analytics/tmp:/app/tmp"
dokku docker-options:add analytics "-v /var/www/analytics/config:/app/config"
```

restart!

```
dokku ps:restart analytics
```

weee, our app should be up! browse to `http://analytics.<your-dokku-domain.tld>`. :)

you should be presented with a Piwik welcome screen.

![Piwik welcome screen](./self-hosted-analytics-using-piwik-and-dokku/setup0.png)

Piwik will perform a system check to make sure all is well. here's what i got.

![First half of Piwik system check](./self-hosted-analytics-using-piwik-and-dokku/setup1.png)
![Second half of Piwik system check](./self-hosted-analytics-using-piwik-and-dokku/setup2.png)

next you will stumble upon a form asking for the database.

let's create a database! on the server:

```
dokku mariadb:start
dokku mariadb:create analytics
```

after it creates and starts a database container, let's fetch the generated credentials so we can input them into the form.

```
dokku config analytics
```

![output of env](./self-hosted-analytics-using-piwik-and-dokku/setup3.png)

"Database Host" is `<DB_HOST>:<DB_PORT>`

enter the details and you'll be on your way. wooo, analytics!

at this point everything should work, until you ever rebuild your app, in which case the database configuration might change without Piwik knowing about it. to solve this issue, edit `/var/www/analytics/config/config.ini.php` and replace the corresponding lines:

```
[database]
host = ${DB_HOST}
username = ${DB_USER}
password = ${DB_PASS}
dbname = ${DB_NAME}
```

sweet as. :)

another thing we can do, recommended by Immortalin, is to [use the database to store session files](http://piwik.org/faq/how-to-install/faq_133/). in `config/config.ini.php`, under the [General] section (add this section if it doesn’t already exist):

```
session_save_handler = dbtable
```


again, this guide is a little rough around the edges, i can't guarantee that everything works. if it does or does not, [message me](http://dinosaur.is)! <3
