var express = require('express');
var router = express.Router();
var request = require('request');
var rp = require('request-promise');
var convert = require('xml-js');
var Ebay = require('ebay-node-api');
var mongoose = require('mongoose');
var EBayTradingApi = require('node-ebay-trading-api');

/* set ebay api setting */
var sandBoxToken = "AgAAAA**AQAAAA**aAAAAA**eIlZXQ**nY+sHZ2PrBmdj6wVnY+sEZ2PrA2dj6wFk4aiCZeApQudj6x9nY+seQ**SRIFAA**AAMAAA**UGASm29SVzVKpFGXNND7WnVGKQ5vbuT7KpJ8MsFcZHMH+UcrxBH+uFr7/UJKrn9Zu4gJNx5pA8RtRou1bUPnp0RN0tg32pHzOZPL/QAAGcUOlIrfrjUo4kV7yRHHYNuFSOKzFNkrPKBdBkMJdBm93W0rLAFaZvjluhs4PZKXa66f+eD9qm5nl5woATbskpl/NfqmUwj8i2sO1wDwcySmQcOYnyj8WNbB6RnPMysRwTWKAyyeEB/od2cc1mA5E/7lpKTYFIirAz06q1hqtLt4LYI6RUDiio6uuu+9eLfo9G5bLX0tZ3xlfyCw22PvPVUJaam2zSLMQOkPm6U2RVCxS1Iiy8M/HF0MLMBTGwwH5OqAmrzsIe7Qr1CZoJrci1CEK939WTXZWSQS01j/7YZanvoRd6tt1oQ/JzU4Vpy6Nuiz/OXD6V4+IvBZOTKyUx+ZK9e97EL4fTDt9hFL4e5a9iX5wrgeSMwk1FJqqmU1t0ysOsSI5VXmBce3GLknHhtUJ4o8f8dRIszEoVWvoha4rDwBAyLHgrpbWF59RUbJyZ76eLbKbU3o7fH9Q8y05qzY55J7N1orZ5t9cJqT0ZYs341ADrtos/9rZ+mmu7NWOyal49Er1Hlk50xcmQsawCZbWrquC5Lvbl5TH3qxYblNqxWg+RMIv5B4qp+tQYf2Wv91SUEHiK1ZN87fP9Im522dHSDLqvWYzJ1lRmfha4eXgOJumpW2mptUnXgmt539xVbVYgtI8m/5NzGVC1/K1IRK";
var productionToken = "AgAAAA**AQAAAA**aAAAAA**6d5jXQ**nY+sHZ2PrBmdj6wVnY+sEZ2PrA2dj6wGmIKmAZWGpg2dj6x9nY+seQ**zhYGAA**AAMAAA**PLnust5qb4bT6RSd5FhP4nEh9w5DLSZub3kIxW82bZPil1P2DMS22d7fhP0MKHVX9/lJIZcg4LuSSG8wv+nJ0UX3L+fnP4BDWILsaEI9E6KrzCF1djKIhrcy9nk0zk+T69Axqjz9iMaVvEilF8wXMGhlgPU6yKLkbxrh5N6R3blhlfyWUQya5aA44siil2XziRQWyr0T0jnMnlRvDcOfRVCfZoNrJGRwd6+Fv11P7X/8uS644n54kBOf/cU9Q6h2zbCxcRNs0qdIbi9QOfQpHitBcfYnN3GwDtDXTKb2B1gvG2Ot1bDlYG67Qql0ionePO60U+9CpqyzndV2zVs7GG+7ukDLzAvZKZrDl+8cCeUJhVA/i1YvAjTIEGvwjwVhu7RXFosuSSJIHiw9RJcSfSNSFoPOYnn76H/9fRcYuE14HkfGtYXmwwg0rGJQg0abM5fIfZ6QcNcJz21Wh70Y4IxIplwJTge/9B293YjmP+BL85PLEFGyv8dnniKnx9sCm2AGCtIsfUWG22R9gv1Jz9pMoDbpJLXn3dO7NQYgk8IGyJWzzoHURc8Q9Eff8pHiK1z7er1Lmf4Tpml2wKDtE8/h/UkprVMcFKJ9kzRSZal2tjQ689yBs6YcX/DL7JxJeMJvPU8vHY2kjWIHnySKNI2VLE4+OJ5bGHv7WcyV7pVI2itCOI4gB7bZWfHRXebMRdJfwu/OPVwdC4q359jUYtRBuajDnu40ESxEo6Dqhzbx8XRTxujgryO4VwAlw9zH";
var token = productionToken;
var productionTradingAPI = "https://api.ebay.com/ws/api.dll";
var productionShoppingAPI = 'http://open.api.ebay.com/shopping';
var sandBoxTradingAPI = "https://api.sandbox.ebay.com/ws/api.dll";
var sandBoxShoppingAPI = 'http://open.api.ebay.com/shopping';
var n;
var lastDate1 = '';
var lastDate2 = '';
var book1 = {}; 
var book2 = {};   
var Schema = mongoose.Schema;
var schemaName1 = new Schema({
  id: String,
  checked: String,
  from: String,
  to: String,
  emailSummary: String,
  type: String,
  htmlContent: String,
  dateTime: String,
  show: false,
  senderId: String,
  replyed:String,
  read:String,
}, {
	collection: 'collection_msg'
});
//create collection.
var Model1 = mongoose.model('Model1', schemaName1);
// connect MongoDB
mongoose.connect( "mongodb://localhost:27017/mymsg");

function getapiMessage(){
  try {
    console.log("/getApimessage");
 
    let body = `<?xml version="1.0" encoding="utf-8"?>
                <GetMyMessagesRequest xmlns="urn:ebay:apis:eBLBaseComponents">
                  <RequesterCredentials>
                    <eBayAuthToken>${token}</eBayAuthToken>
                  </RequesterCredentials>
                  <ErrorLanguage>en_US</ErrorLanguage>
                  <WarningLevel>High</WarningLevel>
                  <DetailLevel>ReturnHeaders</DetailLevel>
                  <StartTime>2019-08-13T00:10:36.000</StartTime>
                  <EndTime>${new Date().toISOString()}</EndTime>
                </GetMyMessagesRequest>`;
                
    var options = {
      url: productionTradingAPI,
      method: 'POST',
      headers: {
        'X-EBAY-API-SITEID': '0',
        'X-EBAY-API-COMPATIBILITY-LEVEL': '967',
        'X-EBAY-API-CALL-NAME': 'GetMyMessages',
      },
      body: body
    };

    request(options, function (error, response, body) {
      let result = JSON.parse(convert.xml2json(body, { compact: true, spaces: 4 }));
      // console.log(result)
      let message = result.GetMyMessagesResponse.Messages.Message;
      console.log(message.Content);      
      var num = 0;  
      for (var element of message) {

          var myJSON = JSON.stringify(element);
          var check_senderId = myJSON.search('ItemID');
          if (check_senderId == -1){
            book1 = new Model1({ id: element.MessageID._text, checked: element.Flagged._text, from: element.Sender._text, to: element.RecipientUserID._text, emailSummary: element.Subject._text, type: element.Read._text === "false" ? "new" : '', htmlContent: element.ItemTitle ? element.ItemTitle._text : '', dateTime:element.ReceiveDate._text, show : false, senderId:"", replyed : element.Replied._text, read : element.Read._text});
  
            book1.save(function (err, book1){ 
              if (err) return console.error(err);
              console.log(book1.senderId + " saved to collection_msg again.");
            }); 
          }
          else{
            book1 = new Model1({ id: element.MessageID._text, checked: element.Flagged._text, from: element.Sender._text, to: element.RecipientUserID._text, emailSummary: element.Subject._text, type: element.Read._text === "false" ? "new" : '', htmlContent: element.ItemTitle ? element.ItemTitle._text : '', dateTime:element.ReceiveDate._text, show: false, senderId:element.ItemID._text, replyed : element.Replied._text, read : element.Read._text});
  
            book1.save(function (err, book1){ 
              if (err) return console.error(err);
              console.log(book1.senderId + " saved to collection_msg again.");
            }); 
          }          
          
      } 
    });
  } catch (error) {
    console.log(error);
  }
}

function getnewMessage() {
  console.log("/getNewmessage");
  try{

    let body = `<?xml version="1.0" encoding="utf-8"?>
                <GetMyMessagesRequest xmlns="urn:ebay:apis:eBLBaseComponents">
                  <RequesterCredentials>
                    <eBayAuthToken>${token}</eBayAuthToken>
                  </RequesterCredentials>
                  <ErrorLanguage>en_US</ErrorLanguage>
                  <WarningLevel>High</WarningLevel>
                  <DetailLevel>ReturnHeaders</DetailLevel>
                  <StartTime>2019-08-13T00:10:36.000</StartTime>
                  <EndTime>${new Date().toISOString()}</EndTime>
                </GetMyMessagesRequest>`;
                
    var options = {
      url: productionTradingAPI,
      method: 'POST',
      headers: {
        'X-EBAY-API-SITEID': '0',
        'X-EBAY-API-COMPATIBILITY-LEVEL': '967',
        'X-EBAY-API-CALL-NAME': 'GetMyMessages',
      },
      body: body
    };
   
    request(options, function (error, response, body) {
      let result = JSON.parse(convert.xml2json(body, { compact: true, spaces: 4 }));
      let message = result.GetMyMessagesResponse.Messages.Message;
      console.log(message.Content);
      Model1.findOne().sort({ dateTime: -1 }).limit(1).exec(function(err,data){
        var lastDate1 = data.dateTime;        
        for (var element of message){   
          var myJSON = JSON.stringify(element);
          var check_senderId = myJSON.search('ItemID');  
          if (check_senderId == -1){
            if(element.ReceiveDate._text >lastDate1){
              book1 = new Model1({ id: element.MessageID._text, checked: element.Flagged._text, from: element.Sender._text, to: element.RecipientUserID._text, emailSummary: element.Subject._text, type: element.Read._text === "false" ? "new" : '', htmlContent: element.ItemTitle ? element.ItemTitle._text : '', dateTime:element.ReceiveDate._text, show: false, senderId:"", replyed : element.Replied._text, read : element.Read._text});
              book1.save(function (err, book1){ 
                if (err) return console.error(err);              
                console.log(book1.checked + " saved to collection_msg:New.");
              });    
              Model1.find().sort({ dateTime: -1 }).limit(1).exec(function(err,data){});  
            }
          }
          else{
            if(element.ReceiveDate._text >lastDate1){
              book1 = new Model1({ id: element.MessageID._text, checked: element.Flagged._text, from: element.Sender._text, to: element.RecipientUserID._text, emailSummary: element.Subject._text, type: element.Read._text === "false" ? "new" : '', htmlContent: element.ItemTitle ? element.ItemTitle._text : '', dateTime:element.ReceiveDate._text, show: false,senderId:element.ItemID._text, replyed : element.Replied._text, read : element.Read._text});
              book1.save(function (err, book1){ 
                if (err) return console.error(err);              
                console.log(book1.checked + " saved to collection_msg:New.");
              });  
              Model1.find().sort({ dateTime: -1 }).limit(1).exec(function(err,data){});  
            }
          }
        }
      });
    });
  } catch (error) {
    console.log(error);
  }
}
setInterval(function(){
  Model1.count({},function(err,count){
    console.log(count)
    if(count == 0) {
      getapiMessage();
    } else {
      getnewMessage();
    }
  });
 
},60000);

//send message via ebay mailbox :2019/09:16
router.post('/sendMessage', function (req, res, next) {
  // console.log(req);
  let body = `<?xml version="1.0" encoding="utf-8"?>
              <AddMemberMessageAAQToPartnerRequest xmlns="urn:ebay:apis:eBLBaseComponents">
                <RequesterCredentials>
                  <eBayAuthToken>${token}</eBayAuthToken>
                </RequesterCredentials>
                <ItemID>${req.body.ItemID}</ItemID>
                <MemberMessage> 
                  <Subject>Thank You for your purchase</Subject>
                  <Body>${req.body.data}</Body>
                  <QuestionType>General</QuestionType>
                  <RecipientID>${req.body.RecipientID}</RecipientID>
                </MemberMessage>
              </AddMemberMessageAAQToPartnerRequest>`;
                          
  var options = {
    method: 'POST',
    url: productionTradingAPI,
    headers: {
      'X-EBAY-API-CALL-NAME': 'AddMemberMessageAAQToPartner',
      'X-EBAY-API-COMPATIBILITY-LEVEL': 967,
      'X-EBAY-API-SITEID': 0
    },
    body: body
  };
  
  rp(options).then(response => {
    try {
      console.log(response);
      var result = JSON.parse(convert.xml2json(response, { compact: true, spaces: 4 }));
      console.log(result.AddMemberMessageAAQToPartnerResponse.Ack._text);
      if(result.AddMemberMessageAAQToPartnerResponse.Ack._text == 'Success'){
        console.log(req.body.email_id);
        Model1.findOne({id : req.body.email_id}, function(err,foundObject){
          if(err){
            console.log(err);
          }
          else{
            console.log(foundObject.replyed);
            foundObject.replyed = 'true';
            foundObject.save(function(err,updatedObject){
              if(err){
              console.log(err);
              }else{
                console.log(updatedObject.replyed);
              }
            });
          }

        });
      }
      
    } catch (error) {
      console.log(error);
      res.send("0");
    } 
   })
});
//delete my message via deleteMyMessage in ebay api
router.post('/deleteMessage', function (req, res, next) {
  // console.log(req);
  console.log(req.body.messageID);
  let body = `<?xml version="1.0" encoding="utf-8"?>
              <DeleteMyMessagesRequest xmlns="urn:ebay:apis:eBLBaseComponents">
                <RequesterCredentials>
                  <eBayAuthToken>${token}</eBayAuthToken>
                </RequesterCredentials>
                <ErrorLanguage>en_US</ErrorLanguage>
                <WarningLevel>High</WarningLevel>
                <MessageIDs>
                  <MessageID>${req.body.messageID}</MessageID>
                </MessageIDs>
              </DeleteMyMessagesRequest>`;
  var options = {
    method: 'POST',
    url: productionTradingAPI,
    headers: {
      'X-EBAY-API-CALL-NAME': 'DeleteMyMessages',
      'X-EBAY-API-COMPATIBILITY-LEVEL': 967,
      'X-EBAY-API-SITEID': 0
    },
    body: body
  };
  rp(options).then(response => {
    try {
      console.log(response);
      var result = JSON.parse(convert.xml2json(response, { compact: true, spaces: 4 }));
      console.log(result);
      if (result.DeleteMyMessagesResponse.Ack._text == "Success") {
        res.send(req.body.messageID);
        Model1.find({ id:req.body.messageID }).remove().exec();
      } else {
        res.send("0");
      }
    } catch (error) {
      console.log(error);
      res.send("0");
    }
  }).catch(error => {
    console.log(error);
    res.send(error);
  });
});
// deleteMultiMessage function 2019:09:18
router.post('/deleteMultiMessage', function (req, res, next) {
  // console.log(req);
  var messageIDs = req.body.messageID;
  console.log(messageIDs.length);
  console.log(req.body.messageID);
  for(var i = 0; i < messageIDs.length; i++){
    console.log(messageIDs[i]);
    let body = `<?xml version="1.0" encoding="utf-8"?>
                <DeleteMyMessagesRequest xmlns="urn:ebay:apis:eBLBaseComponents">
                  <RequesterCredentials>
                    <eBayAuthToken>${token}</eBayAuthToken>
                  </RequesterCredentials>
                  <ErrorLanguage>en_US</ErrorLanguage>
                  <WarningLevel>High</WarningLevel>
                  <MessageIDs>
                    <MessageID>${messageIDs[i]}</MessageID>
                  </MessageIDs>
                </DeleteMyMessagesRequest>`;
    var options = {
      method: 'POST',
      url: productionTradingAPI,
      headers: {
        'X-EBAY-API-CALL-NAME': 'DeleteMyMessages',
        'X-EBAY-API-COMPATIBILITY-LEVEL': 967,
        'X-EBAY-API-SITEID': 0
      },
      body: body
    };
    rp(options).then(response => {
      try {
        console.log(response);
        var result = JSON.parse(convert.xml2json(response, { compact: true, spaces: 4 }));
        console.log(result);
        if (result.DeleteMyMessagesResponse.Ack._text == "Success") {
          // res.send(req.body.messageID);
          Model1.find({ id:messageIDs[i] }).remove().exec();
        } else {
          res.send("0");
        }
      } catch (error) {
        console.log(error);
        res.send("0");
      }
    }).catch(error => {
      console.log(error);
      res.send(error);
    });

  }
});




// getMyMessage function
router.post('/getMyMessage', function (req, res) {
  console.log("/getMyMessage");     
  
  Model1.find({}).sort({'dateTime': 'desc'}).exec(function(err, result) {
		if (err) throw err;
		if (result) {
      let sendResult = [];
      for(var element of result){  
        let email = {};      
        email.id = element.id;
        email.checked = element.checked;
        email.from = element.from;
        email.to = element.to;
        email.emailSummary = element.emailSummary;
        email.type = element.type;
        email.htmlContent = element.htmlContent;
        email.dateTime = element.dateTime;
        email.show = false;
        email.senderId = element.senderId;
        email.replyed = element.replyed;
        email.read = element.read;
        sendResult.push(email);
      }      
      res.send(sendResult);
		} else {
			res.send(JSON.stringify({
				error : 'Error'
			}))
		}
	}) 

});
//getOrderdetail function
router.post('/getOrderdetail',function(req,res){
  console.log("/getOrderdeail");
  console.log(req.body.ItemID);
  let body = `<?xml version="1.0" encoding="utf-8"?>
              <GetItemRequest xmlns="urn:ebay:apis:eBLBaseComponents">
                <RequesterCredentials>
                  <eBayAuthToken>${token}</eBayAuthToken>
                </RequesterCredentials>
                <ItemID>${req.body.ItemID}</ItemID>
              </GetItemRequest>`
  var options = {
    method: 'POST',
    url: productionTradingAPI,
    headers: {
      'X-EBAY-API-CALL-NAME': 'GetItem',
      'X-EBAY-API-COMPATIBILITY-LEVEL': 967,
      'X-EBAY-API-SITEID': 0
    },
    body: body
  };
  rp(options).then(response => {
    try{
      console.log(response);
      var result = JSON.parse(convert.xml2json(response, { compact: true, spaces: 4 }));
      console.log(result.GetItemResponse.Item.ItemID);
      var orderdetail = {};
      orderdetail.ItemID = result.GetItemResponse.Item.ItemID._text;
      orderdetail.ItemLink = result.GetItemResponse.Item.ListingDetails.ViewItemURL._text;
      orderdetail.price = result.GetItemResponse.Item.StartPrice._text;
      orderdetail.currencyID = result.GetItemResponse.Item.StartPrice._attributes.currencyID;
      orderdetail.Itempic = result.GetItemResponse.Item.PictureDetails.GalleryURL._text;
      //2019-09-16
      var postageRate = result.GetItemResponse.Item.ShippingDetails.CalculatedShippingRate.WeightMinor._text;
      var postageValue = result.GetItemResponse.Item.ShippingDetails.InternationalShippingServiceOption.ShippingServiceCost._text
      orderdetail.ItemPostage = postageRate * postageValue;
      orderdetail.itemNumber = result.GetItemResponse.Item.ItemID;
      orderdetail.paypalAddress = result.GetItemResponse.Item.PayPalEmailAddress;
      orderdetail.ItemTitle = result.GetItemResponse.Item.Title._text;
      // console.log(orderdetail);      
      res.send(orderdetail);
    }
    catch(error){
      console.log(error);
    }
  });
});
module.exports = router;




