CREATE TABLE `products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`category` enum('toys','lingerie','oils','kits') NOT NULL,
	`price` int NOT NULL,
	`rating` int NOT NULL DEFAULT 5,
	`reviews` int NOT NULL DEFAULT 0,
	`image` text NOT NULL,
	`tag` varchar(50),
	`description` text,
	`stock` int NOT NULL DEFAULT 0,
	`active` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `products_id` PRIMARY KEY(`id`)
);
