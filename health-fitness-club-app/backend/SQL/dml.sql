INSERT INTO user_account (email, password, first_name, last_name, phone, address, birthday, role) VALUES
('john.doe@example.com', 'hashedpassword1', 'John', 'Doe', '123-456-7890', '123 Main St, Anytown, AN', '1985-04-12', 'Member'),
('jane.smith@example.com', 'hashedpassword2', 'Jane', 'Smith', '234-567-8901', '456 Elm St, Sometown, SM', '1990-07-23', 'Trainer'),
('admin@example.com', 'hashedpassword3', 'Alice', 'Admin', '345-678-9012', '789 Oak St, Anycity, AC', '1980-01-30', 'Admin');

INSERT INTO member (user_id, join_date, membership_end_date) VALUES
((SELECT user_id FROM user_account WHERE email='john.doe@example.com'), '2023-01-01', '2024-01-01');

INSERT INTO trainer (user_id, sport_type) VALUES
((SELECT user_id FROM user_account WHERE email='jane.smith@example.com'), 'Yoga');

INSERT INTO admin (user_id) VALUES
((SELECT user_id FROM user_account WHERE email='admin@example.com'));

INSERT INTO health_metric (member_id, weight, height, bmi, date) VALUES
((SELECT user_id FROM member), 75.50, 1.78, 23.84, '2023-03-15');

INSERT INTO fitness_goal (member_id, goal_description, target_date, start_date) VALUES
((SELECT user_id FROM member), 'Lose 5 kg of weight', '2023-12-31', '2023-03-01');

INSERT INTO exercise_routine (member_id, routine_name, description) VALUES
((SELECT user_id FROM member), 'Morning Yoga', 'Daily morning yoga routine for flexibility and strength.');

INSERT INTO room (room_name) VALUES
('Aerobics Room'),
('Weight Training Room');

INSERT INTO booking_slot (date, start_time, end_time, room_id) VALUES
('2023-05-01', '08:00', '09:00', (SELECT room_id FROM room WHERE room_name='Aerobics Room')),
('2023-05-01', '10:00', '12:00', (SELECT room_id FROM room WHERE room_name='Weight Training Room'));

INSERT INTO training_session (trainer_id, member_id, slot_id) VALUES
((SELECT user_id FROM trainer), (SELECT user_id FROM member), (SELECT slot_id FROM booking_slot WHERE start_time='10:00'));

INSERT INTO class (room_id, class_name, slot_id) VALUES
((SELECT room_id FROM room WHERE room_name='Aerobics Room'), 'Beginner Yoga', (SELECT slot_id FROM booking_slot WHERE start_time='08:00'));

INSERT INTO class_registration (member_id, class_id) VALUES
((SELECT user_id FROM member), (SELECT class_id FROM class WHERE class_name='Beginner Yoga'));

INSERT INTO equipment (name, status) VALUES
('Treadmill', 'Available'),
('Stationary Bike', 'Repairing');

INSERT INTO payment (member_id, sum, date, payment_method) VALUES
((SELECT user_id FROM member), 99.99, '2023-04-01', 'Credit Card');