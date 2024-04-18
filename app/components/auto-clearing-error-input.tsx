import { Input } from "@nextui-org/react";
import { useNavigation } from "@remix-run/react";
import { useCallback, useEffect, useState } from "react";

// A wrapper around NextUI's <Input> that takes an errorMessage and has the following properties:
//
//   - Whenever the user types anything, the errorMessage is automatically suppressed; that's useful because an <Input>
//     that's in an invalid state prevents its parent form from submitting
//   - Whenever a page naviation happens, the errorMessage, if one is still specified, is automatically restored
//   - The error message is also automatically restored if it changes.
//
// This makes rendering server side validation errors much more convenient when using Remix's forms.
export function AutoClearingErrorInput(params: Parameters<typeof Input>[0]) {
  const [showError, setShowError] = useState(true);
  const { state: navigationState } = useNavigation();

  useEffect(() => { setShowError(true) }, [params.errorMessage]); // show the error whenever the error message is modified
  useEffect(() => {
    if (navigationState == "idle") {
      // Navigation state is newly idle; show the error again
      setShowError(true);
    }
  }, [navigationState]);

  // when the user types something in the input...
  const onValueChange = useCallback((value: string) => {
    // ...clear the error...
    setShowError(false);
    // ...then call the original onValueChange hook, if any. (Note that we don't use this anywhere in the Pomodoro app at the moment)
    params.onValueChange?.(value);
  }, [params]);

  params = { ...params };
  if (showError && params.errorMessage) {
    // if an errorMessage prop is specified, automatically add isInvalid={true}
    params.isInvalid = true;
  } else if (!showError) {
    // if we're not supposed to be showing the error, remove it if one was specified
    delete params.errorMessage;
    delete params.isInvalid;
  }

  return <Input {...params} onValueChange={onValueChange} />;
}
