import psycopg2

def connect_to_database():
    try:
       
        conn = psycopg2.connect(
            dbname="taskmanager",  
            user="user",           
            password="user1234",   
            host="localhost",      
            port="5432"            
        )
        print("Connected to the database successfully!")
        return conn
    except psycopg2.Error as e:
        print("Unable to connect to the database.")
        print(e)
        return None
