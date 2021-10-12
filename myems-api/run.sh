#!/bin/sh

gunicorn --pid pid --timeout 600 --workers=4 app:api