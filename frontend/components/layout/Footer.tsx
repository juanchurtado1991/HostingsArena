import Link from "next/link";

interface FooterProps {
  dict: any;
  lang: string;
}

export function Footer({ dict, lang }: FooterProps) {
  return (
    <footer className="bg-secondary/20 border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="font-bold text-lg">HostingArena</h3>
            <p className="text-sm text-muted-foreground">
              {dict.footer.tagline}
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">VPNs</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href={`/${lang}/compare?type=vpn`} className="hover:text-foreground">{dict.footer.link_compare_vpn}</Link></li>
              <li><Link href={`/${lang}/vpn/nordvpn`} className="hover:text-foreground">{dict.footer.link_nordvpn}</Link></li>
              <li><Link href={`/${lang}/vpn/expressvpn`} className="hover:text-foreground">{dict.footer.link_expressvpn}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Hosting</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href={`/${lang}/compare?type=hosting`} className="hover:text-foreground">{dict.footer.link_compare_hosting}</Link></li>
              <li><Link href={`/${lang}/hosting/bluehost`} className="hover:text-foreground">{dict.footer.link_bluehost}</Link></li>
              <li><Link href={`/${lang}/hosting/siteground`} className="hover:text-foreground">{dict.footer.link_siteground}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">{dict.footer.company}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-foreground">{dict.footer.link_about}</Link></li>
              <li><Link href="#" className="hover:text-foreground">{dict.footer.link_methodology}</Link></li>
              <li><Link href="#" className="hover:text-foreground">{dict.footer.link_contact}</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} HostingArena. {dict.footer.rights_reserved}
        </div>
      </div>
    </footer>
  );
}
