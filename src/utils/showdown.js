export const showdownOptions = () => {
  return {
    tables: true,
    emoji: true,
    // tasklists: true, // TODO: find why this creates issues (unsafe HTML)
    // parseImgDimensions: true,
    strikethrough: true,
    openLinksInNewWindow: true,
    extensions: [],
  }
}

export default {
  showdownOptions,
}
