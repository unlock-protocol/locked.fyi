import { useState, useEffect, useContext } from "react"
import Box from "3box"
import { NOTES_SPACE_NAME } from "../constants"
import BoxContext from "../contexts/boxContext"

// We should set the box and account in a context!
export const useBox = (address) => {
  const { setBox } = useContext(BoxContext)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const loadBox = async () => {
      if (address) {
        setLoading(true)
        const theBox = await Box.create()
        await theBox.auth([NOTES_SPACE_NAME], {
          address,
          provider: window.ethereum,
        })
        setBox(theBox)
        setLoading(false)
      }
    }

    loadBox()
  }, [address, setBox])
  return { loading }
}

export default useBox
