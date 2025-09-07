#!/usr/bin/env python3
import markdown
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT, TA_CENTER
from bs4 import BeautifulSoup
import re

def markdown_to_pdf(md_file, pdf_file):
    # Ler o arquivo markdown
    with open(md_file, 'r', encoding='utf-8') as f:
        md_content = f.read()
    
    # Converter markdown para HTML
    html = markdown.markdown(md_content, extensions=['markdown.extensions.tables'])
    
    # Parse HTML com BeautifulSoup
    soup = BeautifulSoup(html, 'html.parser')
    
    # Criar PDF
    doc = SimpleDocTemplate(pdf_file, pagesize=A4)
    styles = getSampleStyleSheet()
    
    # Criar estilos personalizados
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=20,
        spaceAfter=30,
        alignment=TA_CENTER,
        textColor=colors.darkblue
    )
    
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=16,
        spaceBefore=20,
        spaceAfter=12,
        textColor=colors.darkgreen
    )
    
    subheading_style = ParagraphStyle(
        'CustomSubHeading',
        parent=styles['Heading3'],
        fontSize=14,
        spaceBefore=15,
        spaceAfter=10,
        textColor=colors.darkred
    )
    
    normal_style = styles['Normal']
    
    story = []
    
    # Processar elementos HTML
    for element in soup.find_all(['h1', 'h2', 'h3', 'p', 'ul', 'li', 'strong', 'em', 'hr']):
        if element.name == 'h1':
            # Título principal
            text = element.get_text().strip()
            # Remover emojis básicos
            text = re.sub(r'🎯|📊|✅|❌|🟡|🔴|🎉|⚠️|🚨|💡|🏆|📈|🚀|🎊|📅', '', text)
            story.append(Paragraph(text, title_style))
            story.append(Spacer(1, 20))
            
        elif element.name == 'h2':
            # Subtítulos
            text = element.get_text().strip()
            text = re.sub(r'🎯|📊|✅|❌|🟡|🔴|🎉|⚠️|🚨|💡|🏆|📈|🚀|🎊|📅', '', text)
            story.append(Paragraph(text, heading_style))
            story.append(Spacer(1, 12))
            
        elif element.name == 'h3':
            # Sub-subtítulos
            text = element.get_text().strip()
            text = re.sub(r'🎯|📊|✅|❌|🟡|🔴|🎉|⚠️|🚨|💡|🏆|📈|🚀|🎊|📅', '', text)
            story.append(Paragraph(text, subheading_style))
            story.append(Spacer(1, 8))
            
        elif element.name == 'p':
            # Parágrafos
            text = element.get_text().strip()
            if text:
                # Limpar emojis
                text = re.sub(r'[🎯📊✅❌🟡🔴🎉⚠️🚨💡🏆📈🚀🎊📅🎪🔧⭐🌟💪🔥⚡🎭🎨🎵🎸🎤🎬🎮🎲🎳🎯🎪]', '', text)
                story.append(Paragraph(text, normal_style))
                story.append(Spacer(1, 6))
                
        elif element.name == 'ul':
            # Listas
            for li in element.find_all('li'):
                text = li.get_text().strip()
                if text:
                    # Limpar emojis e adicionar bullet
                    text = re.sub(r'[🎯📊✅❌🟡🔴🎉⚠️🚨💡🏆📈🚀🎊📅🎪🔧⭐🌟💪🔥⚡🎭🎨🎵🎸🎤🎬🎮🎲🎳🎯🎪]', '', text)
                    text = f"• {text}"
                    story.append(Paragraph(text, normal_style))
                    story.append(Spacer(1, 4))
                    
        elif element.name == 'hr':
            # Linha horizontal
            story.append(Spacer(1, 10))
            story.append(Paragraph('_' * 80, normal_style))
            story.append(Spacer(1, 10))
    
    # Construir PDF
    doc.build(story)
    print(f"PDF criado com sucesso: {pdf_file}")

if __name__ == "__main__":
    try:
        markdown_to_pdf("STATUS_HOMOLOGACAO_IFOOD.md", "STATUS_HOMOLOGACAO_IFOOD.pdf")
    except Exception as e:
        print(f"Erro ao converter: {e}")