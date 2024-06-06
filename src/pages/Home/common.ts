// const fs = require('fs');
import * as fs from 'fs';
// const data = {
//   name: 'John Smith',
//   age: 30,
//   job: 'Software Developer'
// };

export const writeToPresets = (data: any) => {
    const dataString = JSON.stringify(data);

    fs.writeFile('./data/presets.json', dataString, (error: any) => {
      if (error) {
        console.error('写入json文件错误：', error);
      } else {
        console.log('成功写入json文件');
      }
    });
}
