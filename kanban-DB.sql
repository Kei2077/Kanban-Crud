CREATE DATABASE kanban_db;
USE kanban_db;

CREATE TABLE IF NOT EXISTS tarefas (
    id int NOT NULL AUTO_INCREMENT,
    titulo VARCHAR(255) NOT NULL,
    descricao VARCHAR(255),
    status VARCHAR(255) NOT NULL,
    data_criacao DATETIME(6),
    PRIMARY KEY (id)
)

select * FROM tarefas;