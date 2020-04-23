/**
 * Basic Audio plugin
 */
const audio = () => {
  const extension = {
    type: "lang",
    regex: /\[!audio\]\((http.*)\)/g,
    replace: (match, url) => {
      return `<audio controls>
      <source src="${url}">
Your browser does not support the audio element.
</audio> `
    },
  }
  return [extension]
}

/**
 * Basic Video plugin
 */
const video = () => {
  const extension = {
    type: "lang",
    regex: /\[!video\]\((http.*)\)/g,
    replace: (match, url) => {
      return `<video controls>
      <source src="${url}">
Your browser does not support the video element.
</audio> `
    },
  }
  return [extension]
}

export const showdownOptions = () => {
  return {
    tables: true,
    emoji: true,
    // tasklists: true, // TODO: find why this creates issues (unsafe HTML)
    // parseImgDimensions: true,
    strikethrough: true,
    openLinksInNewWindow: true,
    extensions: [audio, video],
  }
}

export default {
  showdownOptions,
}
