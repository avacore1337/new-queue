if [ "$HOSTNAME" = queue ]; then
    printf '%s\n' "No you don't"
else
    psql -f init.sql && diesel migration run && psql -f testing.sql
fi

