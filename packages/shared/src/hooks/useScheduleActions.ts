/**
 * Hook to handle actions from the schedule page
 *
 * @param redirect - Function to redirect to new URL
 * @returns an object with the following properties:
 * - handleButtonClick: Function to handle button click events
 */
const useScheduleActions = (redirect: (url: string) => void) => {
  const handleButtonClick = (id: string) => {
    redirect(`/recipe/${id}`);
  };

  return { handleButtonClick };
};

export default useScheduleActions;
