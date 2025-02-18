exports.getAllProducts = (req, res) => {
    res.json([{ id: 101, name: 'Laptop' }, { id: 102, name: 'Điện thoại' }]);
};

exports.createProduct = (req, res) => {
    const { name } = req.body;
    res.status(201).json({ message: 'Product created', product: { id: Date.now(), name } });
};
