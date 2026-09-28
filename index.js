const express = require('express');
const fs = require('fs');
const fsPromises = require('fs/promises');
const path = require('path');
const app = express();
const PORT = 3000;
const productsFolderPath = path.join(name, 'products');
const filePath = path.join(productsFolderPath,'products.json');
if (!fs.existsSync(productsFolderPath)) {fs.mkdirSync(productsFolderPath,{recursive: true});}
if (!fs.existsSync(filePath)) {fs.writeFileSync(filePath, JSON.stringify([], null, 2),'utf8');}
app.use(express.json());
async function readProducts() {
    try {
        const data = await fsPromises.readFile(filePath,'utf8');
        return JSON.parse(data || '[]');
    }catch(err){return [];}
  }
async function writeProducts(products){await fsPromises.writeFile(filePath,
        JSON.stringify(products, null, 2),'utf8'
 );
}
app.get('/products', async (req, res) => {
    try {
        const products = await readProducts();res.status(200).json({
            success: true,
            data: products
        });}
        catch (err){res.status(500).json({success: false,message: 'Server error'});}
});
app.get('/products/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        const products = await readProducts();
        const product = products.find( p => p.id === id );
        if (!product) {
            return res.status(404).json({success: false,message: 'not exist'});}
        res.status(200).json({success: true,data:product });
    } catch (err){res.status(500).json({success:false,message:'Server error'});}
});
app.post('/products', async (req, res) => {
    try {
        const { name, desc, price } = req.body;
        const products = await readProducts();
        const id =
            products.length > 0
                ? products[products.length - 1].id + 1
                : 1;
        const newProduct= {
            id,
            name,
            desc,
            price: Number(price)
        };
        products.push(newProduct);
        await writeProducts(products);
        res.status(201).json({success: true,message: 'Added successfully',data: newProduct});
    }catch (err){
        res.status(500).json({success:false,message:'Server error'});}
});
app.put('/products/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        const products = await readProducts();
        const index = products.findIndex(
            p => p.id === id
        );
        if (index === -1) {
            return res.status(404).json({success: false,message: 'not exist'});}
        products[index] = {
            ...products[index],
            ...req.body,
            price: req.body.price?Number(req.body.price):products[index].price, id};
        await writeProducts(products);
        res.status(200).json({success: true,message:'edit successfully',data: products[index]
        });
    } catch (err) {
        res.status(500).json({success: false, message: 'Server error'});}
});
app.delete('/products/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        let products = await readProducts();
        const exists = products.some(p => p.id === id);
        if (!exists) {
            return res.status(404).json({success: false,message: 'already not exist'});
        }
        products = products.filter( p => p.id !== id );
        await writeProducts(products);
        res.status(200).json({success: true,message: `deleted ${id}`
        });
    } catch (err){
        res.status(500).json({success: false,message: 'Server error'});
}
});
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});