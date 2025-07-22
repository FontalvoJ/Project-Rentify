import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  @Input() images: { src: string; alt: string }[] = [
    { src: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSM2fVimKBufYYSlPeWrADW7Eplh1DtW45J8w&s', alt: 'Logo de Ferrari' },
    { src: 'https://cdn.freebiesupply.com/logos/large/2x/bmw-logo-logo-png-transparent.png', alt: 'Logo de BMW' },
    { src: 'https://download.logo.wine/logo/Audi/Audi-Logo.wine.png', alt: 'Logo de Audi' },
    { src: 'https://cdn.freebiesupply.com/logos/large/2x/porsche-3-logo-png-transparent.png', alt: 'Logo de Porsche' },
    { src: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTPkGqT_r5T-OOveBDOI8cWvXnvZYiwNRUxBA&s', alt: 'Logo de Mercedes' },
    { src: 'https://cdn.freelogovectors.net/wp-content/uploads/2023/05/lincoln_logo-freelogovectors.net_.png', alt: 'Logo de Lincoln' },
    { src: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRcbZBeDtQXgjvvX2T4GRj7StL73tMICo7c3uOu1D5kvUIzhN97zzV-WJ6kxR8rCL-q86A&usqp=CAU', alt: 'Logo de Rolls Royce' },
    { src: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTZ-4OnhTdzBIujaFrOgJX5q9F96gB6YHRIKQ&s', alt: 'Logo de Tesla' },
    { src: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRQP5tXt0Y3sV-9QSNr1-8aBwspkm8y2E8LhfE-ney_gfE_0Ws0cGpP5KoETEjvOraR0gg&usqp=CAU', alt: 'Logo de Maserati' },
    { src: 'https://www.cdnlogo.com/logos/l/84/lamborghini.svg', alt: 'Logo de Lamborgini' },
    { src: 'https://static.vecteezy.com/system/resources/previews/001/199/293/non_2x/jaguar-logo-png.png', alt: 'Logo de Jaguar' }

    
  ];
  @Input() isAnimated: boolean = true;
  @Input() animationDuration: string = '70s';
}

