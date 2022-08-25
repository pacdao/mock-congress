import * as React from "react";
import styled from "styled-components";
import { color } from "styles/globalStyles";

const SCORE = [
  [-5, "anti-crypto"],
  [0, "neutral"],
  [5, "pro-crypto"],
];

type Props = {
  className?: string;
};

const ScoreDefinition = ({ className }: Props) => {
  const [showDef, setShowDef] = React.useState(false);

  return (
    <InfoSection className={className}>
      <Label onClick={() => setShowDef(!showDef)}>Score Definition</Label>
      <List className={showDef ? "show" : ""}>
        {SCORE.map(([score, label]) => {
          return (
            <Item key={score}>
              <span>{score}:</span> {label}
            </Item>
          );
        })}
      </List>
    </InfoSection>
  );
};

const InfoSection = styled.div`
  margin-bottom: 1.5em;

  font-size: 0.9rem;
  line-height: 1;
  text-align: left;
`;

const Label = styled.strong`
  cursor: help;
  border-bottom: 1px solid;

  :hover {
    color: ${color.yellow};
  }
`;

const List = styled.ul`
  display: none;

  &.show {
    display: block;
    margin-top: 1em;
  }
`;

const Item = styled.li`
  margin-top: 0.2em;

  span {
    display: inline-block;
    margin-right: 0.25em;
    width: 1.5em;
    text-align: right;
  }
`;

export default ScoreDefinition;
