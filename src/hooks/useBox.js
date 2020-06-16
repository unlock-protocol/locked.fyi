import { useState, useEffect, useContext } from "react"
import Box from "3box"
import { NOTES_SPACE_NAME } from "../constants"
import BoxContext from "../contexts/boxContext"

// We should set the box and account in a context!
export const useBox = (address) => {
  const { setBox, setSpace } = useContext(BoxContext)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const loadBox = async () => {
      if (address) {
        setLoading(true)
        const box = await Box.create()
        await box.auth([NOTES_SPACE_NAME], {
          address,
          provider: window.ethereum,
        })
        const space = await box.openSpace(NOTES_SPACE_NAME)
        setSpace(space)
        setBox(box)
        setLoading(false)
      }
    }

    loadBox()
  }, [address, setBox, setSpace])
  return { loading }
}

export default useBox
