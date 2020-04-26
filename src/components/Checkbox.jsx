import React from "react"
import styled from "styled-components"

const Checkbox = ({ onChange, checked, label, name }) => (
  <Styled onClick={() => onChange(!checked)}>
    <input type="checkbox" checked={checked} name={name} />
    <label htmlFor={name}>{label}</label>
  </Styled>
)

export default Checkbox

const Styled = styled.div`
  margin-top: 10px;
  margin-bottom: 10px;
  > input {
    opacity: 0;
    display: none;
  }
  > input + label {
    position: relative;
    padding-left: 30px;
    cursor: pointer;
    &:before {
      content: "";
      position: absolute;
      vertical-align: middle;
      left: 0;
      top: 5px;
      width: 20px;
      height: 20px;
      border: 1px solid #aaa;
      background: white;
      border-radius: 3px;
      box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
      margin-right: 5px;
    }

    &:after {
      content: "✔";
      position: absolute;
      top: 3px;
      left: 3px;
      font-size: 18px;
      color: #ff6771;
      transition: all 0.2s;
    }
  }
  > input:not(:checked) + label {
    &:after {
      opacity: 0;
      transform: scale(0);
    }
  }
  > input:checked + label {
    &:after {
      opacity: 1;
      transform: scale(1);
    }
  }
`
