# LEDIS DEMO

## Overview
Ledis is a simple, stripped-down version of the famous Redis database. This app supports some of basic functionalities such as String, Set, List and Expire data. I also provide a web-base CLI to demonstrate its functions. 

This project is wrote by Javascript using React framework. Web local storage is used for storing data. And, it is deployed on Heroku for demonstration.

## Self evaluation
This app supports all the function in String, Set and List. The expire of data is also supported. It also have the demo version on Heroku, you can find the link here. But the snapshot feature is not available.


## Thought process
When I read the assignment description and criteria, I made a list of questions that needed to be clear: 
+ What is Redis, how it used ?
+ What is Redis CLI ? 
+ How to access the data without the help of database ?
+ What is cache, local storage ? 
+ How to create terminal on web ? 
+ How can we make customized CLI ? 


After answering those questions, I outlined three major issues that must be addressed in this assignment:
+ Find effective storage to retrive, modify and store data   
+ Design web-base terminal for Ledis CLI or find existed library on the internet
+ Implement logic functions to handle the inputed string, and return the proper results.

And I dealt with those issues one by one in that sequence.
## UI/UX Design 
Concerning Ledis's UI/UX, I attempted to rebuild the terminal from scratch. Unfortunately, things did not go as planned. After spending so much effort developing my own terminal, I decided to look for existing react libraries in the community. And I discovered react-terminal, a package that allows you to use the terminal as a component in a react project. It allows you to customize commands, prompts, and error messages, as well as callbacks (async/non-async) for each command. I utilized those functionalities to build this app.
To create the draggable terminal window, I also use the react-draggable package. Because I want to create the web page to look like the MacOS UI.

![UI demo](/public/demoUI.png "UI demo")

## Data storage

When it come to the storage, within the scope of this assignment, I used the local storage of the browser to storing the data. The reasons are : 
+ Web storage is more secure, and data may be kept locally without slowing down the website.
+ Unlike cookies, the storage limit is much higher (at least 5MB), and data is never sent to the server.
+ Web storage is per origin (per domain and protocol). All pages, from one origin, can store and access the same data.
+ Local storage also use key-value to store the data, which is appropriate for this assignment.

The disadvantage of using local storage is that data is only kept in the user's browser and cannot be shared with others.

Three methods of **localStorage** i used most in this project:
```js
// Store
localStorage.setItem(key, value);

// Retrieve
localStorage.getItem(key);

// Delete
localStorage.removeItem(key);
```

## Implementation 

For commands, the react-terminal library provides callbacks (async/non-async). When you type a string into the screen and press enter. It will read the first word of the string and call the function associated with that word; it will also pass the remainder of the string as arguments to the functions as needed.

```js
const commands = {
    SET: (key_value) => handleSet(key_value),
    GET: (key) => handleGet(key),
    RPUSH: (key_values) => handleRPush(key_values),
    RPOP: (key) => handleRPOP(key),
    LRANGE: (key_start_stop) => handleLRange(key_start_stop),
    SADD: (key_values) => handleSAdd(key_values),
    SREM: (key_values) => handleSRem(key_values),
    SMEMBERS: (key) => handleSMembers(key),
    SINTER: (keys) => handleSInter(keys),
    KEYS: () => handleKeys(),
    DEL: (key) => handleDel(key),
    EXPIRE: (key_second) => handleExpire(key_second),
    TTL: (key) => handleTTL(key),
  };
```

The fundamental idea behind the implementation is that when the user enters a command, each command will trigger a specified function. In each function, we must first catch some errors such as incorrect syntax and command. Following that, we use string manipulation to retrieve the key and value of the given string. Then we do some logic operation on those string. Finally we do get/set/delete operations on local storage.

### String 
First we need to define a datatype for string : 
```js
    export class LString {
        constructor(value) {
            this.value = value;
            this.expiry = null;
            this.type = "string";
        }
    }
```
This LString class have **value** to store the string, **expiry** to check for expire time(default value is null), and **type** to define the datatype in value as string. 

***Demo code will be explained in this code block***
```js
// SET
const handleSet = (key_value) => {
    const arr = key_value.trim().split(/\s+/); // split function
    if (arr.length > 2) { // check for the syntax 
      return "Error: Wrong syntax. (Must be SET key value)"; //if wrong return the message
    } else {
      let key = arr[0];
      let value = arr[1];
      const item = new LString(value); // after check, push the data to storage
      localStorage.setItem(key, JSON.stringify(item));
        return "OK";
    }
  };
```

```js
// GET
const handleGet = (key) => {
    let item = JSON.parse(localStorage.getItem(key)); // get item from localStorage
    if (item && item.type !== "string") return "ERROR : value in key is not the string type"; // return error if item is not string
    const now = new Date();
    if (item && item.expiry && now.getTime() > item.expiry) {
      localStorage.removeItem(key);
      item = null; // check for expiry item, if it is expired delete it and set item to null
    }
    if (!item) {
      return "Error : Key not found!"; // return error if key is not in local storage
    }
    return item.value;
  };
```
### List
One of the challenges of this task is determining an effective data structure for implementing an ordered list. It must be capable of performing both add and pop functions, as well as retrieving the range of the sorted data contained within it. And I implemented the list with a sorted array, which is **O(nlogn)**(n: number of added items) in add items, **O(1)** in pop, and ****O(k)** (k: number of retrieved items) in find range.

```js
export class LList {
  constructor(value) {
    this.value = value; // value is the array of string type
    this.expiry = null; // expire time, default is null
    this.type = "list"; // type of the object
  }
  add(value1){
    this.value.push(value1); // first we add item to the back of array
    this.value.sort(); // then sort it, take logn
  }
}
```

String handling in **LList** is similar to that in **LString**. We split the string into the key and values,and then implement some logic to handle RPUSH, RPOP and LRANGE.

***Demo code will be explained in this code block***

```js
// RPUSH
 const handleRPush = (key_values) => {
    const arr = key_values.trim().split(/\s+/); // split key and value
    if (arr.length < 2) { // check for syntax
      return "Error: Wrong syntax. (Must be KEY value1 [value2...])";
    } else {
      let key = arr[0];
      let item = JSON.parse(localStorage.getItem(key));// get item from key

      const now = new Date();
      if (item && item.expiry && now.getTime() > item.expiry) {
        localStorage.removeItem(key);
        item = null; // check for expiry
      }

      if (item && item.type !== "list") // check type of value in key
        return "ERROR : value in key is not the list type";
      const value = item ? item.value : [];
      const lItem = new LList(value); // create new LList
      for (let i = 1; i < arr.length; i++) {
        lItem.add(arr[i]); // add to LList
      }
      
      localStorage.setItem(key, JSON.stringify(lItem)); // push back to local storage
      let leng = lItem.value.length;
      return `>(interger) ${leng}`; // return length of list in key
    }
  };
```
### Set

 The Javascript 's built-in set data structure is used to implement Ledis' LSET. Because the value attribute in the LSet is array, we must convert it to Set to add or delete items, and then cast it back to array to push to local storage.
 ```js
 export class LSet {
  constructor(value) {
    this.value = value; //value is array of string type
    this.expiry = null; // expired time, default : null
    this.type = "set"; // set type 
  }
}
 ```

 ***Demo code for a function will be explained in this code block***

 ```js
 // SADD
 const handleSAdd = (key_values) => {
    const arr = key_values.trim().split(/\s+/); // split the string to key and values

    if (arr.length < 2) {
      return "Error: Wrong syntax. (Must be SADD key value1 [value2...]"; // check syntax
    } else {
      const key = arr[0];
      let item = JSON.parse(localStorage.getItem(key)); // get item store in key
      if (item && item.type !== "set")
        return "ERROR : Value stored in key is not the set type"; // check for type of value in key
      const now = new Date();
      if (item && item.expiry && now.getTime() > item.expiry) { // check for the expiry time
        localStorage.removeItem(key);
        item = null;
      }
      let value = item ? item.value : [];
      const sItem = new LSet(value); // initialize LSET
      const set = new Set(sItem.value); // cast value to Set
      for (let i = 1; i < arr.length; i++) {
        set.add(arr[i]); // perform add to set
      }
      sItem.value = Array.from(set); // cast back from set to array
      let leng = sItem.value.length; 
      localStorage.setItem(key, JSON.stringify(sItem)); // push back to local storage
      return `(interger) ${leng}`;// return the length of the set
    }
  };
 ```

 ### Data Expiration:

 One issue that arises when using local storage is that the data contained within it does not expire with time. We can only get rid of it by using the **localStorage.remove(key)** method. Instead of having the data items expire at the precise moment, we will save the expiration time along with the value, and upon retrieving the item, we will compare the current time with the stored expiry time; if the current time is higher than the stored expiry time, we will destroy it immediately.

 Whenever we want to use **localStorage.getItem()**, it will have to check the expiration time.

## References

Some of the libraries and documents used to complete this assignment : 
+ [react-terminal](https://www.npmjs.com/package/react-terminal)
+ [react-draggable](https://www.npmjs.com/package/react-draggable)
+ [Local storage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
+ [Redis](https://redis.io/)
+ [Set Expiry Time (TTL) for LocalStorage With Javascript](https://www.sohamkamani.com/javascript/localstorage-with-ttl-expiry/)
+ [Get the Intersection of two Sets using JavaScript](https://bobbyhadz.com/blog/javascript-get-intersection-of-two-sets)