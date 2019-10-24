const fs = require('fs');
const cleanDist = (path) => {
    const files = fs.readdirSync(path);
    if (files) files.forEach(file => fs.unlinkSync(`${path}/${file}`));
};
cleanDist('./dist');
