App = {
  web3Provider: null,
  contracts: {},

  init: function() {
    return App.initWeb3();
  },

  initWeb3: async function() {
    //----
    // Modern dapp browsers...
    if (window.ethereum) {
      App.web3Provider = window.ethereum;
      try {
        // Request account access
        await window.ethereum.enable();
      } catch (error) {
        // User denied account access...
        console.error("User denied account access")
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      App.web3Provider = window.web3.currentProvider;
    }
    // If no injected web3 instance is detected, fall back to Ganache
    else {
      App.web3Provider = new     Web3.providers.HttpProvider('http://localhost:7545');
    }
    web3 = new Web3(App.web3Provider);
    //----
    return App.initContract();
  },

  initContract: function() {
    $.getJSON('Soft2Point.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract.
      var Soft2PointArtifact = data;
      App.contracts.Soft2Point = TruffleContract(Soft2PointArtifact);

      // Set the provider for our contract.
      App.contracts.Soft2Point.setProvider(App.web3Provider);

      // Use our contract to retieve and mark the adopted pets.
      return App.getBalances();
    });

    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '#transferButton', App.handleTransfer);
  },

  handleTransfer: function(event) {
    event.preventDefault();

    var amount = parseInt($('#SSTransferAmount').val());
    var toAddress = $('#SSTransferAddress').val();

    console.log('Transfer ' + amount + ' SS to ' + toAddress);

    var Soft2PointInstance;
    
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];
      
      App.contracts.Soft2Point.deployed().then(function(instance) {
        Soft2PointInstance = instance;

        //return Soft2PointInstance.transfer(toAddress, web3.toWei(amount), {from: account, gas: 100000});
        return Soft2PointInstance.transfer(toAddress, web3.toWei(amount), {from: account});
      }).then(function(result) {
        alert('Transfer Successful!');
        return App.getBalances();
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },

  getBalances:  function() {
    console.log('Getting balances...');

    var Soft2PointInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];   

      App.contracts.Soft2Point.deployed().then(function(instance) {
        Soft2PointInstance = instance;

        return Soft2PointInstance.balanceOf(account)
      }).then(function(result) {
        //bal = web3.fromWei( result.c[0]+""+ result.c[1],'ether');
        bal = web3.fromWei(result.toString(),'ether');
        console.log(web3.toWei(bal));
        console.log(result);

        
        
        
        $('#SSBalance').text(bal);
        $('#SSTransferAmount').val("")
        $('#SSTransferAddress').val("")
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  }

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
