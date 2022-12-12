const parseTitle = (text) => {
    return text.replace(/[-]/g, m => " ").replace(/(^\w|\s\w)/g, m => m.toUpperCase())
}



module.exports = {parseTitle}