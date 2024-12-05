# Kusk Dashboard

## Development

#### Setup

Install Node.js:

```
brew install node
```

Install dependencies:

```
npm install
```

##### Add Kuskd Deamon
Add a folder named `kuskd` under the root folder. Put all the kuskd files into that folder.
```
kusk-electron
│   README.md
│
└───kuskd
│   │   kuskd-darwin_amd64
│   │   kuskd-linux_386
│   │   kuskd-linux_amd64
│   │   kuskd-windows_386.exe
│   │   kuskd-windows_amd64.exe
│   │  
``` 


To developer the kusk electron app, run the script.
```
DEV=ture electron .
```

---
#### Package

To package the app for all platform, run the following command. 

```
npm run package
```
