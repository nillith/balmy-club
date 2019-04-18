CREATE TABLE Users (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(32) UNIQUE,
    nickname VARCHAR(32),
    avatarUrl VARCHAR(255),
    bannerUrl VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    circlerCount INT DEFAULT 0,
    role INT,
    salt BLOB(32),
    hash BLOB(64),
    INDEX (username (10)),
    INDEX (email (10))
);

CREATE TABLE Posts (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    authorId BIGINT UNSIGNED,
    reShareFromPostId BIGINT UNSIGNED,
    content TEXT,
    visibility INT,
    plusCount INT UNSIGNED DEFAULT 0,
    reShareCount INT UNSIGNED DEFAULT 0,
    mentionIds TEXT,
    createdAt BIGINT,
    updatedAt BIGINT,
    deletedAt BIGINT,
    INDEX (authorId , createdAt)
);

CREATE TABLE Comments (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    postId BIGINT UNSIGNED,
    authorId BIGINT UNSIGNED,
    content TEXT,
    plusCount INT UNSIGNED DEFAULT 0,
    mentionIds TEXT,
    createdAt BIGINT,
    updatedAt BIGINT,
    deletedAt BIGINT,
    INDEX (postId , authorId)
);

CREATE TABLE PostPlusOnes(
id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
postId BIGINT UNSIGNED NOT NULL,
userId BIGINT UNSIGNED NOT NULL,
UNIQUE(postId, userId)
);

CREATE TABLE CommentPlusOnes(
id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
commentId BIGINT UNSIGNED NOT NULL,
userId BIGINT UNSIGNED NOT NULL,
UNIQUE(commentId, userId)
);

CREATE TABLE Circles (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(32) NOT NULL,
    ownerId BIGINT UNSIGNED NOT NULL,
    userCount INT UNSIGNED DEFAULT 0,
    INDEX (ownerId)
);

CREATE TABLE CircleUser (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    circleId BIGINT UNSIGNED,
    userId BIGINT UNSIGNED,
    UNIQUE (circleId, userId)
);

CREATE TABLE UserBlockUser(
id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
blockeeId BIGINT UNSIGNED,
blockerId BIGINT UNSIGNED,
UNIQUE(blockeeId, blockerId)
);

CREATE TABLE PostCircle (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    postId BIGINT UNSIGNED REFERENCES Posts (id),
    circleId BIGINT UNSIGNED,
    UNIQUE (postId, circleId)
);

CREATE TABLE Activities (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    subjectId BIGINT NOT NULL,
    objectId BIGINT NOT NULL,
    contextId BIGINT,
    objectType INT NOT NULL,
    actionType INT NOT NULL,
    contextType INT,
    `timestamp` BIGINT NOT NULL,
    INDEX (`timestamp` , subjectId , objectType)
);

CREATE TABLE Notifications (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    recipientId BIGINT,
    activityId BIGINT,
    `timestamp` BIGINT,
    isRead BOOL DEFAULT FALSE,
    UNIQUE(recipientId, activityId),
    INDEX (`timestamp` , recipientId)
);

CREATE TABLE Subscriptions (
	id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    subscribeeId BIGINT,
    subscriberId BIGINT,
    INDEX (subscribeeId),
    INDEX (subscriberId)
);
