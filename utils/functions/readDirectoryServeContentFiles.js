const readDirectoryServeContentFiles = async (routePath, readdir, readFile, path, req, res) => {

    try {

        const files = await readdir(routePath);

        let contentType = 'text/plain';

        files.map((file) => {

            const ext = path.extname(file);
            const filePath = routePath + '/' + file
            const fileUri = '/' + file

            if (ext === '.html') {
            contentType = 'text/html';
            } else if (ext === '.css') {
            contentType = 'text/css';
            } else if (ext === '.js') {
            contentType = 'text/javascript';
            } else if (ext === '.svg') {
                contentType = 'image/svg+xml';
            } else if (ext === '.ico') {
                contentType = 'image/x-icon';

            }
                
            else {
        
                contentType = 'text/plain'

            }


            if (req.url === fileUri) {

                res.writeHead(200, { 'content-type': `${contentType}` })
                res.write(
                    
                    readFile(filePath, 'utf8')

                    .then((data) => {
                        
                    res.write(data);
                    res.end();
                    })
                    .catch((err) => {
                    console.error('Error reading the file:', err);
                    res.statusCode = 500;
                    res.end('Internal Server Error');
                    })
                
                )
                res.end()
            
            } else if (req.url === '/') {

                res.writeHead(200, { 'content-type': `text/html` })
                res.write(
                    
                    readFile('./navbar-app/index.html', 'utf8')

                    .then((data) => {
                    res.write(data);
                    res.end();
                    })
                    .catch((err) => {
                    console.error('Error reading the file:', err);
                    res.statusCode = 500;
                    res.end('Internal Server Error');
                    })
                
                )
                res.end()

            }

        })

      } catch (err) {
        console.error(err);
      }


}
module.exports = {readDirectoryServeContentFiles}