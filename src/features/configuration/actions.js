let actions = {
  submitConfiguration: (data) => {
    if (data.type == 'testnet'){
      window.ipcRenderer.send('kuskdInitNetwork','testnet')
    }else if(data.type == 'mainnet'){
      window.ipcRenderer.send('kuskdInitNetwork','mainnet')
    }else if(data.type == 'solonet'){
      window.ipcRenderer.send('kuskdInitNetwork','solonet')
    }
    return (dispatch) => (dispatch)
  }
}

export default actions
