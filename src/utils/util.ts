import { HistoryManager } from "../pages/Canvas/common/HistoryManager";
import { IHistoryState } from "./type";

export const historyManager = new HistoryManager<IHistoryState>();
// 字符串转json文件
export const stringToJsonFile = async (str: string, title: string = '常用曲速合集.json') => {
  if (!str) return;
  const blob = new Blob([str], { type: 'application/json' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = title;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
}

/**
 * uuid
 */
export const getCryptoUuid = () => {
  if (typeof crypto === 'object') {
    if (typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    if (typeof crypto.getRandomValues === 'function' && typeof Uint8Array === 'function') {
      const callback = (c: any) => {
        const num = Number(c);
        return (num ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (num / 4)))).toString(16);
      };
      // @ts-ignore
      return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, callback);
    }
  }
  let timestamp = new Date().getTime();
  let perforNow = (typeof performance !== 'undefined' && performance.now && performance.now() * 1000) || 0;
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    let random = Math.random() * 16;
    if (timestamp > 0) {
      random = (timestamp + random) % 16 | 0;
      timestamp = Math.floor(timestamp / 16);
    } else {
      random = (perforNow + random) % 16 | 0;
      perforNow = Math.floor(perforNow / 16);
    }
    return (c === 'x' ? random : (random & 0x3) | 0x8).toString(16);
  });
};


/**
 * 数组去重
 * @param arr 
 * @returns 
 */
export const arrayDeduplication = (arr: any[]) => {
  const set = new Set<any>(arr);
  return Array.from(set);
}

type MapFromObject<K extends string | number, V> = Map<K, V>;

/**
 * 对象转Map
 * @param obj 
 * @returns 
 */
export const objectToMap = <K extends string | number, V>(obj: { [key in K]: V }): MapFromObject<K, V> => {
  const map = new Map<K, V>();
  Object.entries(obj).forEach(([key, value]) => {
    map.set(key as K, value as V);
  });
  return map;
};

/**
 * map转对象
 * @param map 
 * @returns 
 */
export const mapToObject = <K extends string | number, V>(map: MapFromObject<K, V>): { [key in K]: V } => {
  const obj: { [key in K]: V } = {} as { [key in K]: V };
  map.forEach((value, key) => {
    obj[key] = value;
  });
  return obj;
};

/**
 * 数组对象查找某个值
 */
export const findValueObj = (arr: Array<any>, key: string, value: any, isEqual = true) => {
  if (!(arr && Array.isArray(arr))) {
    return -1;
  }
  const obj = arr.find(item => {
    if (item[key]) {
      return isEqual ? item[key] === value : item[key].indexOf(value) > -1;
    } else {
      return false;
    }
  });
  // console.log("???",obj)
  return obj;
};

/**
 * 深拷贝
 * @param obj 
 * @returns 
 */
export const deepClone = (obj: any) => {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * 获取画布元素 
 */
export const getCanvasEle = () => {
  return document.getElementById('drawing');
}