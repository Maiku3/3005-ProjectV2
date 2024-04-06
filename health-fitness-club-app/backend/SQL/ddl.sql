CREATE TYPE user_role AS ENUM ('Member', 'Trainer', 'Admin');

CREATE TABLE user_account (
    user_id SERIAL PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(150) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    phone VARCHAR(20),
    address VARCHAR(150),
    birthday DATE,
    creation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    role user_role NOT NULL
);

CREATE TABLE member (
    user_id INTEGER PRIMARY KEY,
    join_date DATE NOT NULL,
    membership_end_date DATE, 
    FOREIGN KEY (user_id) REFERENCES user_account (user_id) ON DELETE CASCADE
);

CREATE TABLE trainer (
    user_id INTEGER PRIMARY KEY,
    sport_type VARCHAR(50), 
    FOREIGN KEY (user_id) REFERENCES user_account (user_id) ON DELETE CASCADE
);

CREATE TABLE admin (
    user_id INTEGER PRIMARY KEY, 
    FOREIGN KEY (user_id) REFERENCES user_account (user_id) ON DELETE CASCADE
);

CREATE TABLE health_metric (
    metric_id SERIAL PRIMARY KEY,
    member_id INTEGER NOT NULL,
    weight NUMERIC(6,2) NOT NULL CHECK (weight > 0),
    height NUMERIC(5,2) NOT NULL CHECK (height > 0),
    bmi NUMERIC(5,2),
    date DATE NOT NULL,
    FOREIGN KEY (member_id) REFERENCES member(user_id)
);

CREATE TABLE fitness_goal (
    goal_id SERIAL PRIMARY KEY,
    member_id INTEGER NOT NULL,
    goal_description VARCHAR(200),
    target_date DATE,
    start_date DATE NOT NULL,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (member_id) REFERENCES member(user_id)
);

CREATE TABLE exercise_routine (
    routine_id SERIAL PRIMARY KEY,
    member_id INTEGER NOT NULL,
    routine_name VARCHAR(50),
    description VARCHAR(200),
    FOREIGN KEY (member_id) REFERENCES member(user_id)
);

CREATE TABLE room (
    room_id SERIAL PRIMARY KEY,
    room_name VARCHAR(50) NOT NULL
);

CREATE TABLE booking_slot (
    slot_id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    room_id INTEGER NOT NULL,
    FOREIGN KEY (room_id) REFERENCES room(room_id)
);

CREATE TABLE training_session (
    session_id SERIAL PRIMARY KEY,
    trainer_id INTEGER NOT NULL,
    member_id INTEGER NOT NULL,
    slot_id INTEGER NOT NULL, 
    FOREIGN KEY (trainer_id) REFERENCES trainer(user_id),
    FOREIGN KEY (member_id) REFERENCES member(user_id),
    FOREIGN KEY (slot_id) REFERENCES booking_slot(slot_id) 
);

CREATE TABLE class (
    class_id SERIAL PRIMARY KEY,
    room_id INTEGER NOT NULL,
    class_name VARCHAR(100),
    slot_id INTEGER NOT NULL, 
    FOREIGN KEY (room_id) REFERENCES room(room_id),
    FOREIGN KEY (slot_id) REFERENCES booking_slot(slot_id)
);

CREATE TABLE class_registration (
    registration_id SERIAL PRIMARY KEY,
    member_id INTEGER NOT NULL,
    class_id INTEGER NOT NULL,
    FOREIGN KEY (member_id) REFERENCES member(user_id),
    FOREIGN KEY (class_id) REFERENCES class(class_id)
);

CREATE TYPE equipment_status AS ENUM ('Available', 'Repairing', 'Unavailable');

CREATE TABLE equipment (
    equipment_id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    status equipment_status NOT NULL DEFAULT 'Available' 
);

CREATE TABLE payment (
    transaction_id SERIAL PRIMARY KEY,
    member_id INTEGER NOT NULL,
    sum NUMERIC(10,2) NOT NULL,
    date DATE NOT NULL,
    payment_method VARCHAR(50), 
    FOREIGN KEY (member_id) REFERENCES member(user_id)
);