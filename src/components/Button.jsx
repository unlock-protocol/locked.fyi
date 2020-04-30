import styled from "styled-components"

export const Button = styled.button`
  font-size: 0.8em;
  width: 100px;
  height: 40px;
  border: none;
  border-radius: 4px;
  padding: 10px;
  display: block;
  text-decoration: none;
  cursor: pointer;
  background-color: #ff6771;
  &:disabled {
    background-color: #cccccc;
  }
  color: white;
  font-weight: bold;
  &:hover {
    box-shadow: 1px 2px 2px rgba(0, 0, 0, 0.3);
  }
  display: flex;
  justify-content: center;
`

export default {
  Button,
}
