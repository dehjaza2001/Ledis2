import "./App.css";
import { ReactTerminal } from "react-terminal";
import * as React from "react";
import Draggable from "react-draggable";
import { LList, LSet, LString } from "./Data_Structure/Classes";

function getIntersection(setA, setB) {
  const intersection = new Set(
    [...setA].filter(element => setB.has(element))
  );

  return intersection;
}

function App() {
  const handleSet = (key_value) => {
    const arr = key_value.trim().split(/\s+/);
    //console.log(arr);
    if (arr.length !== 2) {
      return "Error: Wrong syntax. (Must be SET key value)";
    } else {
      let key = arr[0];
      let value = arr[1];
      const item = new LString(value);
      localStorage.setItem(key, JSON.stringify(item));
        return "OK";
    }
  };

  const handleGet = (key) => {
    let item = JSON.parse(localStorage.getItem(key));
    if (item && item.type !== "string") return "ERROR : value in key is not the string type";
    const now = new Date();
    if (item && item.expiry && now.getTime() > item.expiry) {
      localStorage.removeItem(key);
      item = null;
    }
    if (!item) {
      return "Error : Key not found!";
    }
    return item.value;
  };

  const handleRPush = (key_values) => {
    const arr = key_values.trim().split(/\s+/);
    //console.log(arr);
    if (arr.length < 2) {
      return "Error: Wrong syntax. (Must be RPUSH KEY value1 [value2...])";
    } else {
      let key = arr[0];
      let item = JSON.parse(localStorage.getItem(key));

      const now = new Date();
      if (item && item.expiry && now.getTime() > item.expiry) {
        localStorage.removeItem(key);
        item = null;
      }

      if (item && item.type !== "list")
        return "ERROR : value in key is not the list type";
      const value = item ? item.value : [];
      const lItem = new LList(value);
      for (let i = 1; i < arr.length; i++) {
        lItem.add(arr[i]);
      }
      
      localStorage.setItem(key, JSON.stringify(lItem));
      let leng = lItem.value.length;
      return `>(interger) ${leng}`;
    }
  };

  const handleRPOP = (key) => {
    let item = JSON.parse(localStorage.getItem(key));
    if (item && item.type !== "list")
      return "ERROR : value is not the list type";
    const now = new Date();
    if (item && item.expiry && now.getTime() > item.expiry) {
      localStorage.removeItem(key);
      item = null;
    }
    if (!item) {
      return "Error : key not found";
    } else {
      if (!item.value.length) {
        return "Nothing left to pop";
      } else {
        let lastEle = item.value.pop();
        localStorage.setItem(key, JSON.stringify(item));
        return `(Removed element:) ${lastEle}`;
      }
    }
  };

  const handleLRange = (key_start_stop) => {
    const arr = key_start_stop.trim().split(/\s+/);
    if (arr.length !== 3) {
      return "Error: Wrong syntax. (Must be LRANGE key start stop)";
    }
    let key = arr[0];
    let item = JSON.parse(localStorage.getItem(key));
    if (item && item.type !== "list")
      return "ERROR : Value stored in key is not the list type";
    const now = new Date();
    if (item && item.expiry && now.getTime() > item.expiry) {
      localStorage.removeItem(key);
      item = null;
    }
    if (!item) {
      return "Error : key not found";
    } else {
      const item = JSON.parse(localStorage.getItem(key));
      const list = item.value;
      let start = parseInt(arr[1]);
      let stop = parseInt(arr[2]);
      if (isNaN(start) || isNaN(stop) || start < 0 || stop >= list.length)
        return "Error: Start and stop must be non-negative integers and within the range of list";

      let range = "> ";
      for (let i = start; i <= stop; i++) {
        range += list[i] + " ";
      }
      return range;
    }
  };

  const handleSAdd = (key_values) => {
    const arr = key_values.trim().split(/\s+/);

    if (arr.length < 2) {
      return "Error: Wrong syntax. (Must be SADD key value1 [value2...]";
    } else {
      const key = arr[0];
      let item = JSON.parse(localStorage.getItem(key));
      if (item && item.type !== "set")
        return "ERROR : Value stored in key is not the set type";
      //
      const now = new Date();
      if (item && item.expiry && now.getTime() > item.expiry) {
        localStorage.removeItem(key);
        item = null;
      }
      let value = item ? item.value : [];
      const sItem = new LSet(value);
      const set = new Set(sItem.value);
      for (let i = 1; i < arr.length; i++) {
        set.add(arr[i]);
      }
      sItem.value = Array.from(set);
      let leng = sItem.value.length;
      localStorage.setItem(key, JSON.stringify(sItem));
      return `(interger) ${leng}`;
    }
  };

  const handleSRem = (key_values) => {
    const arr = key_values.trim().split(/\s+/);
    if (arr.length < 2) {
      return "Error: Wrong syntax. (Must be SREM key value1 [value2...])";
    } else {
      const key = arr[0];
      let item = JSON.parse(localStorage.getItem(key));
      if (item && item.type !== "set")
        return "ERROR : Value stored in key is not the set type";
      const now = new Date();

      if (item && item.expiry && now.getTime() > item.expiry) {
        localStorage.removeItem(key);
        item = null;
      }
      if (!item) {
        return "Error : key not found";
      }
      const set = new Set(item.value);
      for (let i = 1; i < arr.length; i++) {
        set.delete(arr[i]);
      }
      item.value = Array.from(set);
      localStorage.setItem(key, JSON.stringify(item));
      return "Sucessfully Removed";
    }
  };

  const handleSMembers = (key) => {
    const arr = key.trim().split(/\s+/);
    if (arr.length !== 1) {
      return "Error: Wrong syntax. (SMEMBERS key)";
    }

    let item = JSON.parse(localStorage.getItem(key));
    if (item && item.type !== "set")
      return "ERROR : Value stored in key is not the set type";
    const now = new Date();
    if (item && item.expiry && now.getTime() > item.expiry) {
      localStorage.removeItem(key);
      item = null;
    }
    if (!item) {
      return "Error : key not found";
    }

    if(!item.value.length) return "[]";
    return JSON.stringify(item.value);
  };

  const handleKeys = () => {
    let str = "";
    const now = new Date();
    // tranverse
    for (var i = 0; i < localStorage.length; ++i) {
      let item = JSON.parse(localStorage.getItem(localStorage.key(i)));
      if (item && item.expiry && now.getTime() > item.expiry) {
        localStorage.removeItem(localStorage.key(i));
        i--;
      } else {
        str += `${localStorage.key(i)},`;
      }
    }
    str = str.slice(0, -1);
    return `All keys available: ${str}`;
  };

  const handleDel = (key) => {
    let item = JSON.parse(localStorage.getItem(key));
    const now = new Date();
    if (item && item.expiry && now.getTime() > item.expiry) {
      localStorage.removeItem(key);
      item = null;
    }
    if (!item) {
      return "Error : key not found";
    }

    localStorage.removeItem(key);
    return "Removed successful";
  };

  const handleExpire = (key_value) => {
    const arr = key_value.trim().split(/\s+/);
    if (arr.length !== 2) {
      return "Error: Wrong syntax (Must be EXPIRE key seconds)";
    } else {
      // check second
      const sec = parseInt(arr[1]);
      if (isNaN(sec)) return "seconds must be a positive number!";
      // check expire
      const key = arr[0];
      let item = JSON.parse(localStorage.getItem(key));
      const now = new Date();
      if (item && item.expiry && now.getTime() > item.expiry) {
        localStorage.removeItem(key);
        item = null;
      }
      //check key
      if (!item) {
        return "Error : key not found";
      }
      item.expiry = now.getTime() + sec * 1000;
      localStorage.setItem(key, JSON.stringify(item));
      return `(${sec}s)`;
    }
  };

  const handleTTL = (key) => {
    const item = JSON.parse(localStorage.getItem(key));
    if (!item) return "Error : Key not found!";
    if(item.expiry == null) return "Key has no TTL";
    const now = new Date();
    const time = item.expiry - now.getTime();
    if (item.expiry && time < 0) {
      localStorage.removeItem(key);
      return "Error : Key not found!";
    } else {
      return `${time / 1000}s to expired`;
    }
  };

  const handleSInter = (keys) => {
    const arr_keys = keys.trim().split(/\s+/);
    if (!arr_keys.length) return "Error: Wrong syntax (Must be SINTER [key1] [key2] [key3] ...:";
    let item = JSON.parse(localStorage.getItem(arr_keys[0]));
    if(!item || item.type !== "set") return "Key must be set type";
    var setA = new Set(item.value);
    for(let i = 1 ; i < arr_keys.length ; i++){
      item = JSON.parse(localStorage.getItem(arr_keys[i]));
      if(!item || item.type !== "set") return "Key must be set type";
      let setB = new Set(item.value);
      setA = getIntersection(setA,setB);
    }

    const retArr = Array.from(setA);
    return JSON.stringify(retArr);
  };

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
  return (
 
    <Draggable>
      <div className="container">
        <ReactTerminal
        commands={commands} 
        prompt="ledis>>"
        errorMessage="Invalid command!" />
      </div>
    </Draggable>
  
    
  );
}

export default App;
