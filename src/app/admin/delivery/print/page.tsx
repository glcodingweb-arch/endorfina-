'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import './print.css';

function PrintContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('orderNumber');
  const name = searchParams.get('name');
  const address = searchParams.get('address');
  const phone = searchParams.get('phone');
  const eventName = searchParams.get('eventName');
  const items = searchParams.get('items');

  useEffect(() => {
    // Automatically trigger print dialog
    const timer = setTimeout(() => window.print(), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
        <article className="label-registry">
            <div className="registry-grid">
                
                <header className="section header">
                    <div className="brand-slot">
                        <span className="brand-id">Endorfina Esportes</span>
                        <span className="service-badge">ENTREGA DE KIT</span>
                    </div>
                    <div className="meta-item" style={{ textAlign: 'right' }}>
                        <span className="label-caption">Evento</span>
                        <span className="meta-value">{eventName || 'N/A'}</span>
                    </div>
                </header>

                <section className="section address-block">
                    <span className="label-caption">Destinatário</span>
                    <h1 className="recipient-name">{name || 'Nome não informado'}</h1>
                    <p className="address-detail">
                        {address || 'Endereço não informado'}
                    </p>
                     {phone && <p className="address-detail" style={{marginTop: '4px'}}><strong>Tel:</strong> {phone}</p>}
                </section>

                <section className="section tracking-area">
                     <div className="barcode-visual">
                        <div className="bar w-4"></div><div className="bar w-1"></div><div className="bar w-2"></div>
                        <div className="bar w-3"></div><div className="bar w-1"></div><div className="bar w-4"></div>
                        <div className="bar w-2"></div><div className="bar w-1"></div><div className="bar w-3"></div>
                        <div className="bar w-4"></div><div className="bar w-1"></div><div className="bar w-2"></div>
                        <div className="bar w-3"></div><div className="bar w-4"></div><div className="bar w-1"></div>
                        <div className="bar w-2"></div><div className="bar w-3"></div><div className="bar w-1"></div>
                        <div className="bar w-4"></div><div className="bar w-2"></div><div className="bar w-1"></div>
                    </div>
                    <span className="tracking-number">{orderNumber || 'SEM-PEDIDO'}</span>
                </section>

                <section className="section meta-grid">
                    <div className="meta-item">
                        <span className="label-caption">Pedido</span>
                        <span className="meta-value highlight-value">#{orderNumber}</span>
                    </div>
                    <div className="meta-item">
                        <span className="label-caption">Itens</span>
                        <span className="meta-value">{items} kit(s)</span>
                    </div>
                </section>

                <footer className="footer-registry">
                    <div className="notice-box">
                        Contém itens de atleta. Manusear com cuidado e entregar somente ao destinatário ou responsável autorizado.
                    </div>
                     {orderNumber && (
                        <div className="qr-placeholder">
                             <Image
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=64x64&data=${encodeURIComponent(orderNumber)}`}
                                alt={`QR Code para o pedido ${orderNumber}`}
                                width={64}
                                height={64}
                                unoptimized
                            />
                        </div>
                    )}
                </footer>
            </div>
        </article>
        <div className="no-print" style={{textAlign: 'center', marginTop: '2rem'}}>
             <Button onClick={() => window.print()} variant="outline">
                Imprimir Novamente
            </Button>
        </div>
    </>
  );
}

export default function PrintDeliveryLabelPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center">Carregando etiqueta...</div>}>
            <PrintContent />
        </Suspense>
    )
}
