import React from "react"
import PropTypes from "prop-types"
import styled from "styled-components"
import { useQuery } from "@apollo/react-hooks"
import Select from "react-select"
import locksByOwner from "../queries/locksByOwner"
import { Loading } from "./Loading"

const LockPicker = ({ identity, onLockChange, currentLocks, children }) => {
  const { data, loading } = useQuery(locksByOwner(), {
    variables: {
      owner: identity,
    },
  })

  const locks = data && data.locks

  if (loading || !locks) {
    return <Loading />
  }
  const lockOptions = locks.map((lock) => ({
    value: lock.address,
    label: lock.name || lock.addresss,
  }))

  const selectedLocks = currentLocks
    ? lockOptions.filter((lock) => currentLocks.indexOf(lock.value) > -1)
    : []

  if (lockOptions.length > 0) {
    return (
      <>
        {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
        <label htmlFor="locks">Locks: </label>
        <LockSelect
          inputId="locks"
          isMulti
          isLoading={loading}
          value={selectedLocks}
          onChange={onLockChange}
          options={lockOptions}
          noOptionsMessage={() =>
            "You have not created any lock yet. You will use the community lock..."
          }
        />
      </>
    )
  }

  return children
}

LockPicker.propTypes = {
  identity: PropTypes.string.isRequired,
  onLockChange: PropTypes.func.isRequired,
  currentLocks: PropTypes.arrayOf(PropTypes.string),
}

LockPicker.defaultProps = {
  currentLocks: [],
}

const LockSelect = styled(Select)`
  margin-bottom: 10px;
`

export default LockPicker
