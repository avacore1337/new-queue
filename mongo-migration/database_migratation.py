#!/usr/bin/python3

import psycopg2
import json
from functools import lru_cache

class Person:
    def __init__(self, ugkthid, username, realname):
        self.ugkthid = ugkthid
        self.username = username
        self.realname = realname

    def __str__(self):
        return str((self.ugkthid, self.username, self.realname))

    def create_user_sql_statement(self):
        return "insert into users (ugkthid, username, realname) VALUES " + str((self.ugkthid, self.username, self.realname))

    def create_admin_sql_statement(self, queue_id, admin_type):
        return "INSERT INTO admins (queue_id, user_id, admin_type) VALUES " + str((queue_id, self.id, admin_type))

class Queue:
    def __init__(self, name, info, hiding, locked, assistants, teachers):
        self.name = name
        self.info = info
        self.hiding = hiding
        self.locked = locked
        self.assistants = assistants
        self.teachers = teachers

    def create_sql_statement(self):
        return "INSERT INTO queues (name, info, hiding, locked) VALUES" + str((self.name, self.info, self.hiding, self.locked))

    def __str__(self):
        return "Name: " + self.name + "\nInfo: " + self.info + "\nHiding: " + str(self.hiding) + "\nLocked: " + str(self.locked) + "\n Assistants: [" + ",".join(map(str, self.assistants)) + "\n Teachers: [" + ",".join(map(str, self.teachers)) + "\n"

def main():
    connect_str = "dbname='queuesystem' user='queuesystem' host='localhost' " + \
                  "password='queuesystem'"
    # use our connection values to establish a connection
    conn = psycopg2.connect(connect_str)

    queues = parse_json()
    create_queues(conn, queues)
    users = get_all_users(queues)
    create_users(conn, users)
    create_assistants(conn, queues)
    
    conn.close()

def parse_json():
    with open('queues.json', encoding='utf-8') as f:
        all_queues = []
        for d in f:
            data = json.loads(d.replace("'", ""))
            assistants = [create_person(assistant["ugKthid"].lower(), assistant["username"].lower(), assistant["realname"]) for assistant in data["assistant"]]
            teachers = [create_person(assistant["ugKthid"].lower(), assistant["username"].lower(), assistant["realname"]) for assistant in data["teacher"]]
            queue = Queue(data["name"], data["info"], data["hiding"], data["locked"], assistants, teachers)
            # print(queue)
            all_queues.append(queue)
            # return [queue]
        return all_queues

people = {}

def create_person(ugkthid,b,c):
    global people
    if ugkthid not in people:
        people[ugkthid] = Person(ugkthid,b,c)
    return people[ugkthid]

def create_queues(conn, queues):
        cursor = conn.cursor()
        # run a SELECT statement - no data in there, but we can try it
        for queue in queues:
            cursor.execute(queue.create_sql_statement())
        conn.commit() # <--- makes sure the change is shown in the database

        cursor.execute("""SELECT name, id from queues""")
        conn.commit() # <--- makes sure the change is shown in the database
        rows = cursor.fetchall()
        # print(rows)
        d = {row[0]: row[1] for row in rows if len(row) == 2}
        # print(d)
        for queue in queues:
            queue.id = d[queue.name]
        # queue.id = rows[0][0]
        # print(queue.id)
        # cursor.close()

def get_all_users(queues):
    d = {}
    for queue in queues:
        for user in queue.teachers + queue.assistants:
            if user.ugkthid in d and user != d[user.ugkthid]:
                print()
                print("error, multiple users with same ugkthid")
                print(user)
                print(d[user.ugkthid])
            d[user.ugkthid] = user
    return d.values()

def create_users(conn, users):
    cursor = conn.cursor()
    # run a SELECT statement - no data in there, but we can try it
    # print("creating users:", len(users))
    for user in users:
        cursor.execute(user.create_user_sql_statement())
    conn.commit() # <--- makes sure the change is shown in the database
    cursor.execute("""SELECT ugkthid, id from users""")
    conn.commit() # <--- makes sure the change is shown in the database
    rows = cursor.fetchall()
    # print("fetched amount:",len(rows))
    # print(rows)
    d = {row[0]: row[1] for row in rows if len(row) == 2}
    # print(d)
    for user in users:
        user.id = d[user.ugkthid]

def create_assistants(conn, queues):
    cursor = conn.cursor()
    for queue in queues:
        statements = {}
        # print("assistants")
        for user in queue.assistants:
            # print(user.id)
            statements[user.ugkthid] = user.create_admin_sql_statement(queue.id, "assistant")
        # print("teachers")
        for user in queue.teachers:
            # print(user)
            # print(user.id)
            statements[user.ugkthid] = user.create_admin_sql_statement(queue.id, "teacher")
        for statement in statements.values():
            cursor.execute(statement)
        conn.commit() # <--- makes sure the change is shown in the database

main()
