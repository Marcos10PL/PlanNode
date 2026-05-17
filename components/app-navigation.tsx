import Logo from "./app-logo";
import NavButtons from "./nav/nav-buttons";
import Container from "./ui/container";

export default function AppNavigation() {
  return (
    <nav className="border-b py-3">
      <Container className="flex justify-between items-center">
        <Logo />
        <NavButtons />
      </Container>
    </nav>
  );
}
