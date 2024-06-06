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