INSERT INTO user_account (email, password, first_name, last_name, phone, address, birthday, role) VALUES
('john.doe@example.com', 'hashedpassword1', 'John', 'Doe', '123-456-7890', '123 Main St, Anytown, AN', '1985-04-12', 'Member'),
('jane.smith@example.com', 'hashedpassword2', 'Jane', 'Smith', '234-567-8901', '456 Elm St, Sometown, SM', '1990-07-23', 'Trainer'),
('admin@example.com', 'hashedpassword3', 'Alice', 'Admin', '345-678-9012', '789 Oak St, Anycity, AC', '1980-01-30', 'Admin'),
('mike.jones@example.com', 'hashedpassword4', 'Mike', 'Jones', '555-678-9012', '789 Maple St, Anothertown, AT', '1992-10-15', 'Member'),
('sarah.connor@example.com', 'hashedpassword5', 'Sarah', 'Connor', '556-789-0123', '123 Skynet St, Futurecity, FC', '1983-05-12', 'Trainer');

INSERT INTO member (user_id, join_date, membership_end_date) VALUES
((SELECT user_id FROM user_account WHERE email='john.doe@example.com'), '2023-01-01', '2024-01-01'),
((SELECT user_id FROM user_account WHERE email='mike.jones@example.com'), '2023-02-15', '2024-02-15');

INSERT INTO trainer (user_id, sport_type) VALUES
((SELECT user_id FROM user_account WHERE email='jane.smith@example.com'), 'Yoga'),
((SELECT user_id FROM user_account WHERE email='sarah.connor@example.com'), 'Personal Training');

INSERT INTO admin (user_id) VALUES
((SELECT user_id FROM user_account WHERE email='admin@example.com'));

INSERT INTO health_metric (member_id, weight, height, bmi, date) VALUES
((SELECT user_id FROM member WHERE user_id = (SELECT user_id FROM user_account WHERE email='john.doe@example.com')), 75.50, 1.78, 23.84, '2023-03-15'),
((SELECT user_id FROM member WHERE user_id = (SELECT user_id FROM user_account WHERE email='mike.jones@example.com')), 90.50, 1.98, 23.1, '2023-03-15');


INSERT INTO fitness_goal (member_id, goal_description,  target_date, start_date, is_completed) VALUES
((SELECT user_id FROM member WHERE user_id = (SELECT user_id FROM user_account WHERE email='john.doe@example.com')), 'Lose 5 kg of weight', '2023-12-31', '2023-03-01', TRUE),
((SELECT user_id FROM member WHERE user_id = (SELECT user_id FROM user_account WHERE email='mike.jones@example.com')), 'Run a marathon', '2023-10-01', '2023-03-15', FALSE),
((SELECT user_id FROM member WHERE user_id = (SELECT user_id FROM user_account WHERE email='john.doe@example.com')), 'Complete 10 push-ups', '2023-06-01', '2023-03-01', FALSE);

INSERT INTO exercise_routine (member_id, routine_name, description) VALUES
((SELECT user_id FROM member WHERE user_id = (SELECT user_id FROM user_account WHERE email='john.doe@example.com')), 'Morning Yoga', 'Daily morning yoga routine for flexibility and strength.'),
((SELECT user_id FROM member WHERE user_id = (SELECT user_id FROM user_account WHERE email='john.doe@example.com')), 'Evening Strength', 'Daily evening strength routine for power and muscle growth.'),
((SELECT user_id FROM member WHERE user_id = (SELECT user_id FROM user_account WHERE email='mike.jones@example.com')), 'Morning Yoga', 'Daily morning yoga routine for flexibility and strength.'),
((SELECT user_id FROM member WHERE user_id = (SELECT user_id FROM user_account WHERE email='mike.jones@example.com')), 'Evening Strength', 'Daily evening strength routine for power and muscle growth.');


INSERT INTO room (room_name) VALUES
('Aerobics Room'),
('Weight Training Room');

INSERT INTO booking_slot (date, start_time, end_time, room_id) VALUES
('2023-05-01', '08:00', '09:00', (SELECT room_id FROM room WHERE room_name='Aerobics Room')),
('2023-05-01', '10:00', '12:00', (SELECT room_id FROM room WHERE room_name='Weight Training Room')),
('2023-05-01', '12:00', '14:00', (SELECT room_id FROM room WHERE room_name='Weight Training Room')),
('2023-05-01', '14:00', '15:00', (SELECT room_id FROM room WHERE room_name='Aerobics Room')),
('2023-05-01', '15:00', '16:00', (SELECT room_id FROM room WHERE room_name='Aerobics Room'));

INSERT INTO training_session (trainer_id, member_id, slot_id) VALUES
((SELECT user_id FROM trainer WHERE user_id = (SELECT user_id FROM user_account WHERE email='jane.smith@example.com')), (SELECT user_id FROM member WHERE user_id = (SELECT user_id FROM user_account WHERE email='john.doe@example.com')), (SELECT slot_id FROM booking_slot WHERE start_time='12:00')),
((SELECT user_id FROM trainer WHERE user_id = (SELECT user_id FROM user_account WHERE email='sarah.connor@example.com')), NULL, (SELECT slot_id FROM booking_slot WHERE start_time='14:00')),
((SELECT user_id FROM trainer WHERE user_id = (SELECT user_id FROM user_account WHERE email='jane.smith@example.com')), (SELECT user_id FROM member WHERE user_id = (SELECT user_id FROM user_account WHERE email='mike.jones@example.com')), (SELECT slot_id FROM booking_slot WHERE start_time='15:00'));

INSERT INTO class (room_id, class_name, slot_id) VALUES
((SELECT room_id FROM room WHERE room_name='Aerobics Room'), 'Beginner Yoga', (SELECT slot_id FROM booking_slot WHERE start_time='08:00')),
((SELECT room_id FROM room WHERE room_name='Weight Training Room'), 'Advanced Weight Training', (SELECT slot_id FROM booking_slot WHERE start_time='10:00'));

INSERT INTO class_registration (member_id, class_id) VALUES
((SELECT user_id FROM member WHERE user_id = (SELECT user_id FROM user_account WHERE email='john.doe@example.com')), (SELECT class_id FROM class WHERE class_name='Beginner Yoga')),
((SELECT user_id FROM member WHERE user_id = (SELECT user_id FROM user_account WHERE email='mike.jones@example.com')), (SELECT class_id FROM class WHERE class_name='Advanced Weight Training'));

INSERT INTO equipment (name, status) VALUES
('Treadmill', 'Available'),
('Stationary Bike', 'Repairing');

INSERT INTO payment (member_id, sum, date, payment_method) VALUES
((SELECT user_id FROM member WHERE user_id = (SELECT user_id FROM user_account WHERE email='john.doe@example.com')), 99.99, '2023-04-01', 'Credit Card'),
((SELECT user_id FROM member WHERE user_id = (SELECT user_id FROM user_account WHERE email='mike.jones@example.com')), 99.99, '2023-04-01', 'Credit Card');