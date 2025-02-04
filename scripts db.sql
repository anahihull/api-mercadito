CREATE DATABASE `mercaditolaskarnalitas` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE mercaditolaskarnalitas;

CREATE TABLE Productos (
    id INT AUTO_INCREMENT PRIMARY KEY,  
    nombre VARCHAR(50) NOT NULL,        
    precio FLOAT NOT NULL,              
    descripcion LONGTEXT,               
    imagen LONGTEXT                     
);

USE mercaditolaskarnalitas;
CREATE TABLE Carrito (
    id INT AUTO_INCREMENT PRIMARY KEY,  
    usuario VARCHAR(50) NOT NULL,       
    total FLOAT NOT NULL                
);

USE mercaditolaskarnalitas;
CREATE TABLE Carrito_Productos (
    carrito_id INT,
    producto_id INT,
    cantidad INT NOT NULL,            
    PRIMARY KEY (carrito_id, producto_id),
    FOREIGN KEY (carrito_id) REFERENCES Carrito(id),
    FOREIGN KEY (producto_id) REFERENCES Productos(id)
);


DELIMITER $$


CREATE TRIGGER update_carrito_total_on_insert
AFTER INSERT ON Carrito_Productos
FOR EACH ROW
BEGIN
    DECLARE total_cost FLOAT;

    SELECT SUM(p.precio * cp.cantidad) INTO total_cost
    FROM Carrito_Productos cp
    JOIN Productos p ON cp.producto_id = p.id
    WHERE cp.carrito_id = NEW.carrito_id;


    UPDATE Carrito
    SET total = total_cost
    WHERE id = NEW.carrito_id;
END$$


CREATE TRIGGER update_carrito_total_on_update
AFTER UPDATE ON Carrito_Productos
FOR EACH ROW
BEGIN
    DECLARE total_cost FLOAT;


    SELECT SUM(p.precio * cp.cantidad) INTO total_cost
    FROM Carrito_Productos cp
    JOIN Productos p ON cp.producto_id = p.id
    WHERE cp.carrito_id = NEW.carrito_id;


    UPDATE Carrito
    SET total = total_cost
    WHERE id = NEW.carrito_id;
END$$


CREATE TRIGGER update_carrito_total_on_delete
AFTER DELETE ON Carrito_Productos
FOR EACH ROW
BEGIN
    DECLARE total_cost FLOAT;


    SELECT SUM(p.precio * cp.cantidad) INTO total_cost
    FROM Carrito_Productos cp
    JOIN Productos p ON cp.producto_id = p.id
    WHERE cp.carrito_id = OLD.carrito_id;


    UPDATE Carrito
    SET total = total_cost
    WHERE id = OLD.carrito_id;
END$$

DELIMITER ;
