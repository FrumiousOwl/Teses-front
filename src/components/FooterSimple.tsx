import { Container, Group, Anchor } from '@mantine/core';
import classes from './FooterSimple.module.css';

const links = [
  { link: '#', label: 'Contact' },
  { link: '#', label: 'Privacy' },
  { link: '#', label: 'Blog' },
  { link: '#', label: 'Careers' },
];

export function FooterSimple() {
  const items = links.map((link) => (
    <Anchor<'a'>
      className={classes.link} // Add class for individual link styling
      aria-label={link.label} // Add aria-label for accessibility
      key={link.label}
      href={link.link}
      onClick={(event) => event.preventDefault()}
      size="sm"
    >
      {link.label}
    </Anchor>
  ));

  return (
    <div className={classes.footer}>
      <Container className={classes.inner}>
        <Group className={classes.links}>{items}</Group>
      </Container>
    </div>
  );
}
