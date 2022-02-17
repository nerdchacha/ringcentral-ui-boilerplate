import useIsLoggedIn from '../../hooks/useIsLoggedIn';

const Main = () => {
	useIsLoggedIn();
	return <div> Main </div>;
};

export default Main;
