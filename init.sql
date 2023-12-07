CREATE DATABASE session_auth;

CREATE TABLE user (
	id int NOT NULL AUTO_INCREMENT,
	username varchar(255) NOT NULL,
	hashed_password varchar(255) NOT NULL,
	PRIMARY KEY (id)
);

CREATE TABLE session (
	id varchar(255) NOT NULL,
	user_id varchar(255) NOT NULL,
	PRIMARY KEY (id)
);
