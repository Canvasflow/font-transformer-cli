# Installation
Run `npm install`.

# Setup
Copy all the `.ttf` or `.otf` files inside the folder `In`.

# Run
Now for run the program you need to specify what is the conversion you would like to perform.

## Start
This will compile all the fonts from the `In` directory to `Out` directory.
```
npm start
```

## Optimize
To optimize the `.woff` and `.woff2` conversions run:
```
npm run optimize
``` 
or 
```
node all.js --optimize
```

## TTF to WOFF 
```
npm run ttf:woff
```
This will read all the `.ttf` files inside the `In` directory and transform them to `.woff` files on the `Out` directory.

## TTF to WOFF2
```
npm run ttf:woff2
```
This will read all the `.ttf` files inside the `In` directory and transform them to `.woff2` files on the `Out` directory.

## TTF to WOFF and WOFF2
```
npm run ttf:woff:woff2
```
This will read all the `.ttf` files inside the `In` directory and transform them to `woff` and `.woff2` files on the `Out` directory.

## OTF to WOFF
```
npm run otf:woff
```
This will read all the `.otf` files inside the `In` directory and transform them to `.woff` files on the `Out` directory.

## OTF to WOFF2
```
npm run otf:woff2
```
This will read all the `.otf` files inside the `In` directory and transform them to `.woff2` files on the `Out` directory.

## OTF to WOFF and WOFF2
```
npm run otf:woff:woff2
```
This will read all the `.otf` files inside the `In` directory and transform them to `woff` and `.woff2` files on the `Out` directory.
