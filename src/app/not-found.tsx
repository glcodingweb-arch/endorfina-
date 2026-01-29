
import Link from 'next/link';
import './not-found.css';

export default function NotFound() {
  return (
    <section className="page_404">
      <div className="container">
        <div className="row">
          <div className="col-sm-12 ">
            <div className="col-sm-10 col-sm-offset-1  text-center">
              <div className="four_zero_four_bg">
                <h1 className="text-center ">404</h1>
              </div>

              <div className="contant_box_404">
                <h3 className="h2">Parece que você está perdido</h3>

                <p>a página que você está procurando não está disponível!</p>

                <Link href="/" className="link_404">
                  Ir para a Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
