require('dotenv').config();

const express = require('express')
const mysql = require('mysql2')
const cors = require('cors');



const app = express()
app.use(express.json())
app.use(cors());

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
})

//obtener productos
app.get('/api/products', (req, res)=> {
    pool.query('SELECT * FROM productos', (e,results) => {
        if(e){
            return res.status(500).json({message: 'Database error', error: e})
        }
        res.json(results)
    })
})

app.get('/api/carrito', (req, res)=> {
    pool.query('select id, nombre, descripcion, cantidad, imagen from carrito_productos CP inner join productos P on CP.producto_id = P.Id', (e,results) => {
        if(e){
            return res.status(500).json({message: 'Database error', error: e})
        }
        res.json(results)
    })
})

app.get('/api/total', (req,res) => {
    pool.query('select id, total from carrito', (e, results) => {
        if(e){
            return res.status(500).json({message: 'Database error', error: e})
        }
        res.json(results)
    })
})

app.put('/api/carrito/:id', (req, res) => {
    const productId = req.params.id;
    const { qty } = req.body;

    if (!qty) {
        return res.status(400).json({ message: 'Quantity is required' });
    }

    pool.query(
        'UPDATE carrito_productos SET cantidad = ? WHERE producto_id = ?',
        [qty, productId],
        (err, results) => {
            if (err) {
                return res.status(500).json({ message: 'Database error', error: err });
            }
            if (results.affectedRows === 0) {
                return res.status(404).json({ message: 'Product not found' });
            }
            res.json({ id: productId, qty });
        }
    );
});

app.delete('/api/carrito/:id',(req,res) => {
    const productId = req.params.id;
    pool.query('DELETE FROM carrito_productos WHERE producto_id = ?', [productId], (e, results) => {
        if(e){
            return res.status(500).json({ message: 'Database error', error: e });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(204).send();
    })
})

app.delete('/api/vaciar/', (req, res) => {
    pool.query('DELETE FROM carrito_productos', (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Database error', error: err });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Products not found' });
        }

        res.json({ message: 'Products deleted', affectedRows: results.affectedRows });
    });
});


app.post('/api/carrito', (req,res) => {
    const {id, qty} = req.body;
    if(!id || !qty){
        return res.status(400).json({message: 'Id and quantity are required'})
    }
    pool.query('INSERT INTO carrito_productos (carrito_id, producto_id, cantidad) VALUES(1,?,?)', [id,qty], (err, results) => {
        if(err){
            return res.status(500).json({message: 'Database error', error: err})
        }
        res.status(201).json({id: results.insertId, id, qty})
    })
})


const PORT= process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Sever is running on http://localhost:${PORT}`)
})