require("dotenv").config();
const fs = require("fs");

let prevListings = [];
const resellers = process.env.RESELLERS.split(", ");




const scraper = {
  url:
    "https://sg.carousell.com/search/" +
    encodeURIComponent(process.env.ITEM) +
    "?sort_by=time_created%2Cdescending",


  async scraper(browser) {
    let page = await browser.newPage();

    await page.goto(this.url, { waitUntil: "load", timeout: 0 });

    console.log("page loaded");

    let data = await page.evaluate(function () {
      return window.initialState;
    });

    let listings = [];

    data.SearchListing.listingCards.forEach((e) => {
      const title = e.belowFold[0].stringContent;
      const price = e.belowFold[1].stringContent;
      const condition = e.belowFold[3].stringContent;
      const listingID = e.listingID;
      const thumbnailURL = e.thumbnailURL;
      const seller_username =
        data.Listing.listingsMap[e.listingID].seller.username;
      const itemURL = (
        "https://sg.carousell.com/p/" +
        title.replace(/[^a-zA-Z ]/g, "-") +
        "-" +
        listingID
      ).replace(/ /g, "-");
      const BumpPost = e.aboveFold[0].component === "active_bump";
      const SpotLightPost = e.hasOwnProperty("promoted");

      listing = {
        title: title,
        price: price,
        condition: condition,
        listingID: listingID,
        thumbnailURL: thumbnailURL,
        seller_username: seller_username,
        itemURL: itemURL,
      };

      if (BumpPost || SpotLightPost)
        console.log(
          "Filtering bump posts and spotlight posts from Seller: " +
            seller_username
        );
      else {
        if (!resellers.includes(seller_username)) 
        listings.push(listing);
       
      }
    });
    var asiaTime = new Date().toLocaleString("en-US", {
      timeZone: "Asia/Shanghai",
    });
    dateTime = new Date(asiaTime);

    if (prevListings.length == 0)
      console.log("Script starting... we populate the listings!");
    else {
      diffListings = latestListing(prevListings, listings);
      if (diffListings.length == 0)
        console.log(dateTime + "\t There is no update... :(");
      else {
        console.log(dateTime + "\t There is an update!! :)");
        messages = createMessageString(diffListings);
        telegram_bot_sendtext(messages);
      }
    }
    //  Save for comparison later
    prevListings = listings;
    saveData(listings)
  
  
}
}

const CronJob = require("cron").CronJob;
const job = new CronJob({
  cronTime: process.env.SLEEP_TIME,
  onTick: scraper.scraper,
});


job.start();

//  Message to send to Telegram
function telegram_bot_sendtext(bot_message_array) {
    const axios = require("axios");
  
    bot_token = process.env.BOT_TOKEN;
    bot_chatID = process.env.BOT_CHATID;
  
    bot_message_array.forEach((bot_message) => {
      const send_text =
        "https://api.telegram.org/bot" +
        bot_token +
        "/sendMessage?chat_id=" +
        bot_chatID +
        "&parse_mode=html&text=" +
        encodeURI(bot_message);
  
      axios
        .get(send_text)
        .then(function (response) {
          // handle success
          console.log(response.data.result.text + "\n");
        })
        .catch(function (error) {
          // handle error
          console.log(error.config.url);
        })
        .then(function () {
          // always executed
        });
    });
  }

function latestListing(arr1, arr2) {
  ids = new Set(arr1.map(({ listingID }) => listingID));
  arr2 = arr2.filter(({ listingID }) => !ids.has(listingID));
  return arr2;
}

function createMessageString(listings) {
  msgArr = [];
  let msg = "";

  for (let i = 0; i < listings.length; i++) {
    msg += "title: " + listings[i]["title"] + "\n";
    msg += "Price: " + listings[i]["price"] + "\n";
    msg += "Condition: " + listings[i]["condition"] + "\n";
    msg += "Seller Username: " + listings[i]["seller_username"] + "\n";
    msg += "Thumbnail: " + listings[i]["thumbnailURL"] + "\n";
    msg += "Item Link: " + listings[i]["itemURL"] + "\n";
    msgArr.push(msg);
    // console.log(msg);
    msg = "";
  }
  return msgArr;
}

const saveData = (listings) => {
  const finished = (err) => {
    if (err) {
      console.error(err);
      return;
    }
  };

  const jsonData = JSON.stringify(listings);
  fs.writeFile("data.json", jsonData, finished);
};

module.exports = scraper;

// const price = e.belowFold[1].stringContent
// const condition = e.belowFold[3].stringContent
// const listingId = e.listingId
// const thumbnailURL = e.thumbnailURL
// const sellerUsername = data.Listing.listingMap[e.listingId].sellerUsername
