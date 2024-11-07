import React, { PropsWithChildren } from "react";

export const Memo = React.memo(({ children }: PropsWithChildren) => (
  children
));